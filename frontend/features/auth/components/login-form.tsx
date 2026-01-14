'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useMsal } from '@azure/msal-react';

import { loginRequest } from '@/lib/msal';

export function LoginForm({ className }: { className?: string }) {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await instance.loginPopup(loginRequest);
    } catch (err) {
      console.error('Login error', err);
      setError(err instanceof Error ? err.message : 'Unable to login');
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
        <div className="login-error">
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
          <span>{error}</span>
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
        <a href="#" className="login-link">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="login-link">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
