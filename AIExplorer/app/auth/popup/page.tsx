'use client';

import { useEffect, useState } from 'react';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';

import { isProd } from '@/lib/app-env';
import { getUiErrorMessage, logErrorTrace } from '@/lib/error-utils';

export default function AuthPopupPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    broadcastResponseToMainFrame()
      .catch((err) => {
        logErrorTrace('MSAL popup completion failed', err);
        if (isMounted) {
          setError(
            getUiErrorMessage(
              err,
              'Unable to complete sign-in. Please close this window and try again.',
            ),
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
      {error ? (
        isProd ? (
          <p>{error}</p>
        ) : (
          <pre className="whitespace-pre-wrap text-left text-sm">{error}</pre>
        )
      ) : (
        'Completing sign-in...'
      )}
    </div>
  );
}
