-- Migration : Documentation des buckets Storage nécessaires
-- Date : 2025-01-04
-- Description : Documentation des buckets Supabase Storage requis pour l'application
-- NOTE: Les buckets doivent être créés manuellement via l'interface Supabase ou l'API Storage

-- ============================================
-- BUCKETS STORAGE REQUIS
-- ============================================

-- Bucket: programme-justificatifs
-- Description: Stockage des pièces justificatives des dépenses de programmes
-- Permissions: 
--   - Authenticated users can upload
--   - Public read access (ou authenticated read selon besoins)
--   - Path: {programme_id}/{timestamp}_{random}.{ext}

-- Bucket: candidats-documents
-- Description: Stockage des documents des candidats
-- Permissions:
--   - Authenticated users can upload
--   - Public read access (pour documents publics) ou authenticated read
--   - Path: candidatures/{candidat_id}/{timestamp}_{random}.{ext}

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- Pour créer ces buckets via l'interface Supabase:
-- 1. Aller dans Storage > Buckets
-- 2. Cliquer sur "New bucket"
-- 3. Nom: programme-justificatifs
-- 4. Public: false (recommandé pour la sécurité)
-- 5. File size limit: 10 MB (ou selon besoins)
-- 6. Allowed MIME types: image/*, application/pdf, application/msword, 
--    application/vnd.openxmlformats-officedocument.*, 
--    application/vnd.ms-excel

-- Pour créer via SQL (si extension storage disponible):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'programme-justificatifs',
--   'programme-justificatifs',
--   false,
--   10485760, -- 10 MB
--   ARRAY['image/*', 'application/pdf', 'application/msword', 
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'application/vnd.ms-excel',
--         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
-- );

-- ============================================
-- POLITIQUES STORAGE (RLS) RECOMMANDÉES
-- ============================================

-- Pour programme-justificatifs:
-- - Authenticated users can upload files
-- - Users can only upload to folders matching their programme access
-- - Users can read files from programmes they have access to

-- Note: Ces politiques doivent être créées via l'interface Supabase Storage
-- ou via l'API Storage après création des buckets

