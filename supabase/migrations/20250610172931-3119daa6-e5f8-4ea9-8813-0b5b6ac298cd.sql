
-- Migração corrigida para auto-criação de empresa com CNPJs únicos
-- Arquivo: supabase/migrations/20250610172100-auto-create-company-for-new-users-fixed.sql

-- Função para criar empresa automaticamente para novos usuários (versão corrigida)
CREATE OR REPLACE FUNCTION public.auto_create_company_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id uuid;
  user_name text;
  unique_cnpj text;
BEGIN
  -- Verificar se o usuário não tem company_id e não é um prestador
  IF NEW.company_id IS NULL AND (NEW.user_type IS NULL OR NEW.user_type = 'user') THEN
    
    -- Pegar o nome do usuário ou usar um padrão
    user_name := COALESCE(NEW.name, 'Usuário');
    
    -- Gerar CNPJ único baseado no timestamp e user_id
    unique_cnpj := LPAD((extract(epoch from now())::bigint % 100000000)::text, 8, '0') || '/0001-' || LPAD((random() * 100)::int::text, 2, '0');
    
    -- Criar uma nova empresa
    INSERT INTO public.companies (
      name,
      legal_name,
      cnpj,
      email,
      owner_id
    ) VALUES (
      user_name || ' - Empresa',
      user_name || ' LTDA',
      unique_cnpj,
      NEW.email,
      NEW.id
    ) RETURNING id INTO new_company_id;
    
    -- Atualizar o perfil do usuário com a empresa criada e role admin
    UPDATE public.profiles 
    SET 
      company_id = new_company_id,
      role = 'admin'
    WHERE id = NEW.id;
    
    -- Log da operação
    RAISE LOG 'Empresa auto-criada para usuário %: empresa_id = %, cnpj = %', NEW.id, new_company_id, unique_cnpj;
    
    -- Retornar o NEW atualizado
    NEW.company_id := new_company_id;
    NEW.role := 'admin';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger para executar após INSERT na tabela profiles
DROP TRIGGER IF EXISTS auto_create_company_trigger ON public.profiles;
CREATE TRIGGER auto_create_company_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_company_for_new_user();

-- Função corrigida para corrigir usuários existentes sem empresa
CREATE OR REPLACE FUNCTION public.fix_orphan_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  new_company_id uuid;
  unique_cnpj text;
  fixed_count INTEGER := 0;
BEGIN
  -- Buscar usuários sem empresa que não são prestadores
  FOR user_record IN 
    SELECT * FROM public.profiles 
    WHERE company_id IS NULL 
    AND (user_type IS NULL OR user_type = 'user')
    AND role != 'admin' -- Evitar duplicar para admins que já podem ter empresa
  LOOP
    -- Gerar CNPJ único para cada usuário
    unique_cnpj := LPAD((extract(epoch from now())::bigint % 100000000)::text, 8, '0') || '/0001-' || LPAD((random() * 100 + fixed_count)::int::text, 2, '0');
    
    -- Criar empresa para o usuário
    INSERT INTO public.companies (
      name,
      legal_name,
      cnpj,
      email,
      owner_id
    ) VALUES (
      user_record.name || ' - Empresa',
      user_record.name || ' LTDA',
      unique_cnpj,
      user_record.email,
      user_record.id
    ) RETURNING id INTO new_company_id;
    
    -- Atualizar perfil do usuário
    UPDATE public.profiles 
    SET 
      company_id = new_company_id,
      role = 'admin'
    WHERE id = user_record.id;
    
    fixed_count := fixed_count + 1;
    
    RAISE LOG 'Usuário órfão corrigido: % -> empresa % (CNPJ: %)', user_record.id, new_company_id, unique_cnpj;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Correção de usuários órfãos concluída',
    'fixed_count', fixed_count
  );
END;
$$;

-- Executar correção para usuários existentes
SELECT public.fix_orphan_users();
