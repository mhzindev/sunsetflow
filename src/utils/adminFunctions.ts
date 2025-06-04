
import { supabase } from '@/integrations/supabase/client';

export const createAdminAccessCodeFunction = async () => {
  // Esta função SQL será executada no Supabase para criar uma função administrativa
  const functionSQL = `
    CREATE OR REPLACE FUNCTION public.admin_find_access_code(
      search_email text,
      search_code text
    )
    RETURNS TABLE(
      id uuid,
      code text,
      company_id uuid,
      employee_name text,
      employee_email text,
      is_used boolean,
      expires_at timestamp with time zone,
      used_at timestamp with time zone,
      created_at timestamp with time zone
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        eac.id,
        eac.code,
        eac.company_id,
        eac.employee_name,
        eac.employee_email,
        eac.is_used,
        eac.expires_at,
        eac.used_at,
        eac.created_at
      FROM public.employee_access_codes eac
      WHERE eac.employee_email = search_email 
        AND eac.code = search_code
      ORDER BY eac.created_at DESC
      LIMIT 1;
    END;
    $$;
  `;

  console.log('Função SQL para criar:', functionSQL);
  return functionSQL;
};

export const debugAccessCodes = async (email: string, code: string) => {
  console.log('=== DEBUG: Buscando todos os códigos ===');
  
  // Buscar todos os códigos para debug
  const { data: allCodes, error: allError } = await supabase
    .from('employee_access_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('Todos os códigos:', allCodes);
  console.log('Erro ao buscar todos:', allError);

  // Buscar por email específico
  const { data: emailCodes, error: emailError } = await supabase
    .from('employee_access_codes')
    .select('*')
    .eq('employee_email', email.toLowerCase());
  
  console.log(`Códigos para email ${email}:`, emailCodes);
  console.log('Erro busca por email:', emailError);

  // Buscar por código específico
  const { data: codeCodes, error: codeError } = await supabase
    .from('employee_access_codes')
    .select('*')
    .eq('code', code.toUpperCase());
  
  console.log(`Códigos com código ${code}:`, codeCodes);
  console.log('Erro busca por código:', codeError);

  return {
    allCodes,
    emailCodes,
    codeCodes
  };
};
