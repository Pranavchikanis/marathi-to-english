'use server'

import { cookies } from 'next/headers'
import { env } from '@/config/env'
import { createServiceClient } from '@/lib/supabase/server'
import { ActionResult } from '@/types/api.types'

export async function loginAdmin(secret: string): Promise<ActionResult<void>> {
  if (!env.ADMIN_SECRET_KEY) {
    return { success: false, error: { message: 'Admin login is not configured.' } }
  }

  if (secret === env.ADMIN_SECRET_KEY) {
    cookies().set('admin_token', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
    return { success: true }
  }

  return { success: false, error: { message: 'Invalid secret key.' } }
}

export async function toggleStudentAccess(studentId: string, block: boolean): Promise<ActionResult<void>> {
  const adminToken = cookies().get('admin_token')?.value;
  if (!adminToken) {
    return { success: false, error: { message: 'Unauthorized' } };
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from('students')
    .update({ is_blocked: block })
    .eq('id', studentId);

  if (error) {
    return { success: false, error: { message: error.message } }
  }

  return { success: true }
}
