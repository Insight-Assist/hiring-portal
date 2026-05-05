import { supabase } from './supabase'

export async function getJobStatus(role) {
  const { data } = await supabase
    .from('job_status')
    .select('is_open')
    .eq('role', role)
    .single()
  // Default to open if not found
  return data?.is_open !== false
}

export async function setJobStatus(role, isOpen) {
  const { error } = await supabase
    .from('job_status')
    .upsert({ role, is_open: isOpen, updated_at: new Date().toISOString() })
  return !error
}
