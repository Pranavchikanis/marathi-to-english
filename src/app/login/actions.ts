'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?error=Invalid credentials');
  }

  return redirect('/dashboard');
}

export async function autoLogin() {
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

  let { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session) {
    const { data, error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      return redirect(`/login?error=${signInError.message}`);
    }
  }

  // Ensure DB is initialized for this student
  const { data: authUser } = await supabase.auth.getUser();
  if (authUser?.user) {
    const adminClient = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return ''; }, set() {}, remove() {} } }
    );

    const { data: student } = await (adminClient.from('students') as any).select('id').eq('auth_user_id', authUser.user.id).single();
    
    if (!student) {
      let { data: stage } = await (adminClient.from('curriculum_stages') as any).select('id').eq('level_number', 1).single();
      
      if (!stage) {
        throw new Error("Curriculum stages not found. Please run the curriculum seed script first.");
      }
      
      await (adminClient.from('students') as any).insert({
        auth_user_id: authUser.user.id,
        display_name: 'Student',
        current_stage_id: stage.id
      });
    }
  }

  return redirect('/dashboard');
}
