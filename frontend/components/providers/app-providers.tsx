'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import type { PublicClientApplication } from '@azure/msal-browser';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

import { getMsalInstance } from '@/lib/msal';

export function AppProviders({ children }: { children: ReactNode }) {
  const [msalApp, setMsalApp] = useState<PublicClientApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeMsal = async () => {
    try {
      setError(null);
      const instance = await getMsalInstance();
      setMsalApp(instance);
    } catch (err) {
      console.error('MSAL initialization failed', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
    }
  };

  useEffect(() => {
    initializeMsal();
  }, []);

  const handleRetry = () => {
    setMsalApp(null);
    initializeMsal();
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold text-red-600">
            Authentication Initialization Failed
          </h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Retry Initialization
          </Button>
        </div>
      </div>
    );
  }

  if (!msalApp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Initializing authentication...
      </div>
    );
  }

  return (
    <MsalProvider instance={msalApp}>
      {children}
      <Toaster position="top-center" />
    </MsalProvider>
  );
}
