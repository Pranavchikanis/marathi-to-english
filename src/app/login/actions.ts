'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
        remove(name: string, options: any) { cookieStore.set(name, '', options); },
      },
    }
  );

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${error.message}`);
  }

  // Ensure DB is initialized for this student
  if (authData?.user) {
    const { ensureStudentProfile } = await import('@/lib/auth/student');
    try {
      await ensureStudentProfile(authData.user.id);
    } catch (e: any) {
      if (e.message === 'ACCOUNT_PENDING_APPROVAL') {
         // This is fine, they will be caught by the UI when they hit dashboard
      } else {
        console.error("Profile check failed:", e);
      }
    }
  }

  return redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    return redirect('/login?error=Please fill all fields&mode=signup');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
        remove(name: string, options: any) { cookieStore.set(name, '', options); },
      },
    }
  );

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  });

  if (error) {
    return redirect(`/login?error=${error.message}&mode=signup`);
  }

  // Ensure DB is initialized for this student using their provided name
  if (authData?.user) {
    const { ensureStudentProfile } = await import('@/lib/auth/student');
    try {
      // Pass the name so it defaults correctly during insertion
      await ensureStudentProfile(authData.user.id, name);
    } catch (e: any) {
      if (e.message === 'ACCOUNT_PENDING_APPROVAL') {
         // Expected for new users!
      } else {
        console.error("Profile check failed:", e);
      }
    }
  }

  return redirect('/dashboard');
}
