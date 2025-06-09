
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, access_code } = await req.json()

    if (!email || !access_code) {
      return new Response(
        JSON.stringify({ error: 'Email e código de acesso são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use the existing admin function for secure access verification
    const { data, error } = await supabase.rpc('admin_find_employee_access', {
      search_email: email.toLowerCase().trim(),
      search_code: access_code.toUpperCase().trim()
    })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data || data.length === 0) {
      // Log failed attempt without exposing sensitive data
      console.log(`Failed employee access attempt for email: ${email}`)
      return new Response(
        JSON.stringify({ error: 'Credenciais inválidas ou código expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const accessRecord = data[0]

    // Mark code as used and update timestamp
    await supabase
      .from('employee_access_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', accessRecord.id)

    // Return only necessary data (no sensitive info)
    return new Response(
      JSON.stringify({
        success: true,
        company_id: accessRecord.company_id,
        employee_name: accessRecord.employee_name,
        email: accessRecord.employee_email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
