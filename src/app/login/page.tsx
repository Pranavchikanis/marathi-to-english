'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, signUp } from './actions';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-text-primary">
          {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Tejaswini AI English Tutor
        </p>
      </div>
      
      <form action={mode === 'signin' ? signIn : signUp} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-md bg-status-error/10 p-4 text-sm text-status-error">
            {error}
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-text-primary">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-md border border-border-default bg-surface-default px-3 py-2 text-text-primary shadow-sm focus:border-interactive-default focus:outline-none focus:ring-1 focus:ring-interactive-default"
              placeholder="Tejaswini"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary">Email</label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border border-border-default bg-surface-default px-3 py-2 text-text-primary shadow-sm focus:border-interactive-default focus:outline-none focus:ring-1 focus:ring-interactive-default"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="mt-1 block w-full rounded-md border border-border-default bg-surface-default px-3 py-2 text-text-primary shadow-sm focus:border-interactive-default focus:outline-none focus:ring-1 focus:ring-interactive-default"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" size="lg">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm text-interactive-default hover:text-interactive-hover transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-default p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border-default bg-surface-elevated p-10 shadow-xl">
        <Suspense fallback={<div className="text-center text-text-secondary">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
