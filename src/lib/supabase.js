import { createClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Check if env vars are loaded (only in dev)
if (import.meta.env.DEV) {
  logger.debug('SUPABASE', 'Configuration Supabase vérifiée', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing'
  })
}

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('SUPABASE', 'Variables d\'environnement Supabase manquantes', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please check your .env.local file contains:')
  console.error('  VITE_SUPABASE_URL=your-url')
  console.error('  VITE_SUPABASE_ANON_KEY=your-key')
  console.error('After adding them, restart the dev server (npm run dev)')
} else {
  logger.info('SUPABASE', 'Client Supabase initialisé avec succès')
}

// Create client - will use placeholder if env vars are missing
// Configuration pour persister la session dans localStorage
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, // Persister la session dans localStorage
      autoRefreshToken: true, // Rafraîchir automatiquement le token
      detectSessionInUrl: true, // Détecter la session dans l'URL (pour OAuth)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Utiliser localStorage
    },
  }
)

