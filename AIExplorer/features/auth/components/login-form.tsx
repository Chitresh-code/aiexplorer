'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

import { isProd } from '@/lib/app-env';
import { getUiErrorMessage, logErrorTrace } from '@/lib/error-utils';
import { getLoginRequest } from '@/lib/msal';

export function LoginForm({ className }: { className?: string }) {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await instance.loginPopup(getLoginRequest());
    } catch (err) {
      logErrorTrace('Login error', err);
      setError(
        getUiErrorMessage(
          err,
          'Unable to sign in right now. Please try again.',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login-form-card ${className ?? ''}`}>
      <div className="login-form-header">
        <img src="/ukg-logo.png" alt="UKG Logo" className="login-logo" />
        <h1 className="login-form-title">Welcome to AI Hub</h1>
        <p className="login-form-subtitle">People First AI</p>
      </div>

      {error && (
        <div className="login-error" role="alert" aria-live="polite">
          <svg
            className="login-error-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {isProd ? (
            <span>{error}</span>
          ) : (
            <pre className="whitespace-pre-wrap">{error}</pre>
          )}
        </div>
      )}

      <button
        className="login-microsoft-btn"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="login-spinner-container">
            <div className="login-spinner" />
            <span>Signing in...</span>
          </div>
        ) : (
          <span className="login-microsoft-text">
            Login with your Microsoft Account
          </span>
        )}
      </button>

      <div className="login-form-footer">
        By clicking, you agree to our{' '}
        <a href="/terms" className="login-link">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="login-link">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
