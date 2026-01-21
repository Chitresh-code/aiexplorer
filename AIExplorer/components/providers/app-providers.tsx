'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import type { PublicClientApplication } from '@azure/msal-browser';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

import { getMsalInstance } from '@/lib/msal';
import { isProd } from '@/lib/app-env';
import { getUiErrorMessage, logErrorTrace } from '@/lib/error-utils';

export function AppProviders({ children }: { children: ReactNode }) {
  const [msalApp, setMsalApp] = useState<PublicClientApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeMsal = async () => {
    try {
      setError(null);
      const instance = await getMsalInstance();
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/popup') {
        const response = await instance.handleRedirectPromise();
        if (response?.account) {
          instance.setActiveAccount(response.account);
        }
      }
      setMsalApp(instance);
    } catch (err) {
      logErrorTrace('MSAL initialization failed', err);
      setError(
        getUiErrorMessage(
          err,
          'Authentication is unavailable right now. Please try again.',
        ),
      );
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
          {isProd ? (
            <p className="mb-6 text-gray-600">{error}</p>
          ) : (
            <pre className="mb-6 whitespace-pre-wrap text-left text-sm text-gray-600">
              {error}
            </pre>
          )}
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
