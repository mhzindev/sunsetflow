
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ushqcekjondadeqwieke.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHFjZWtqb25kYWRlcXdpZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTE4MTcsImV4cCI6MjA2NDMyNzgxN30.lU3qJwJkM3fq47KV-LE1rqPMAyzM3aD-YseqC0sIKzY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
