
-- Remover a constraint atual que está bloqueando os novos valores de status
ALTER TABLE public.missions DROP CONSTRAINT IF EXISTS missions_status_check;

-- Criar nova constraint que inclui todos os status necessários
ALTER TABLE public.missions ADD CONSTRAINT missions_status_check 
CHECK (status IN (
  'planning', 
  'in-progress', 
  'pending', 
  'completed', 
  'no-show-client', 
  'no-show-technician', 
  'cancelled'
));

-- Log da operação
SELECT 'Constraint missions_status_check atualizada com novos status permitidos' as result;
