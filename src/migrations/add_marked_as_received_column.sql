
-- Adicionar coluna para rastrear valores marcados como recebidos pelo prestador
ALTER TABLE public.service_providers 
ADD COLUMN IF NOT EXISTS total_marked_as_received NUMERIC DEFAULT 0;

-- Atualizar valores existentes para 0 caso sejam NULL
UPDATE public.service_providers 
SET total_marked_as_received = 0 
WHERE total_marked_as_received IS NULL;
