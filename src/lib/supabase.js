import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mpcfrirkeuekrtxwfwru.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wY2ZyaXJrZXVla3J0eHdmd3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDQxNDcsImV4cCI6MjA5MDcyMDE0N30.uST8zNsR18QkIMLYdBkFNmogu-8Qu96Ttb7ECwF-GQQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
