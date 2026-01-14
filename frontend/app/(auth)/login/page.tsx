'use client';

import { useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, router, returnTo]);

  // Prevent UI flicker - don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <LoginForm />
      </div>
    </div>
  );
}
