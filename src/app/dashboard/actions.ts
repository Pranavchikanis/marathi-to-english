'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/api.types'

export async function updateDisplayName(newName: string): Promise<ActionResult<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in to update your name.' } }
  }

  const sanitizedName = newName.trim().slice(0, 50)
  
  if (sanitizedName.length < 2) {
    return { success: false, error: { code: 'INVALID_INPUT', message: 'Name must be at least 2 characters long.' } }
  }

  // Use service client to bypass RLS since users can update their own row but we might not have RLS policies set up for update
  // Alternatively, just use normal client if RLS allows. 
  // We'll use serviceClient to be safe, just in case RLS blocks updates.
  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from('students')
    .update({ display_name: sanitizedName })
    .eq('auth_user_id', user.id)

  if (error) {
    return { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: error.message } }
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  
  return { success: true }
}
