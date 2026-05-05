import { supabase } from './supabase'

export async function getJobStatus(role) {
  try {
    const { data, error } = await supabase
      .from('job_status')
      .select('is_open')
      .eq('role', role)
      .single()
    if (error) return true // default to open if table not ready
    return data?.is_open !== false
  } catch {
    return true
  }
}

export async function setJobStatus(role, isOpen) {
  try {
    const { error } = await supabase
      .from('job_status')
      .upsert(
        { role, is_open: isOpen, updated_at: new Date().toISOString() },
        { onConflict: 'role' }
      )
    return !error
  } catch {
    return false
  }
}
