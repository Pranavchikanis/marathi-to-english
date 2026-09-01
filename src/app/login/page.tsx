import { autoLogin } from './actions';
import { use } from 'react';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = use(searchParams);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome to Tejaswini AI</h2>
          <p className="mt-2 text-sm text-gray-600">Your personal English learning assistant</p>
        </div>
        
        <form action={autoLogin} className="mt-8 space-y-6">
          {params?.error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {params.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full transform justify-center rounded-xl bg-indigo-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Enter Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
