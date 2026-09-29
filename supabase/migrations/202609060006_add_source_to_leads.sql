-- Adiciona coluna source para armazenar URL de origem da LP (webhook WordPress)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
