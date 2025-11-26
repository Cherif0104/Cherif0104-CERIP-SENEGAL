import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbhuuswonlotxtsedhrj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHV1c3dvbmxvdHh0c2VkaHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTk4ODksImV4cCI6MjA3OTIzNTg4OX0.fwBz1vOtIR6Cx-YiINn_HHeK0S2Y8f0S9dEGCS2vjPY'

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY n\'est pas défini dans les variables d\'environnement')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

