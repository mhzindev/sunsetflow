
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DataIntegrityStatus {
  isIsolated: boolean;
  totalRecords: number;
  companyRecords: number;
  orphanRecords: number;
  error?: string;
}

export const useDataIntegrity = () => {
  const [status, setStatus] = useState<DataIntegrityStatus>({
    isIsolated: false,
    totalRecords: 0,
    companyRecords: 0,
    orphanRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.company_id) {
      checkDataIntegrity();
    }
  }, [profile?.company_id]);

  const checkDataIntegrity = async () => {
    try {
      setLoading(true);
      
      if (!profile?.company_id) {
        setStatus({
          isIsolated: false,
          totalRecords: 0,
          companyRecords: 0,
          orphanRecords: 0,
          error: 'Usuário sem empresa associada'
        });
        return;
      }

      console.log('🔍 Verificando integridade dos dados para empresa:', profile.company_id);

      // Verificar isolamento em todas as tabelas principais
      const checks = await Promise.all([
        // Transações
        supabase.from('transactions').select('id, company_id'),
        // Pagamentos  
        supabase.from('payments').select('id, company_id'),
        // Missões
        supabase.from('missions').select('id, company_id'),
        // Despesas
        supabase.from('expenses').select('id, company_id')
      ]);

      let totalRecords = 0;
      let companyRecords = 0;
      let orphanRecords = 0;

      checks.forEach(({ data, error }) => {
        if (error) {
          console.error('❌ Erro na verificação:', error);
          return;
        }

        if (data) {
          totalRecords += data.length;
          
          data.forEach(record => {
            if (record.company_id === profile.company_id) {
              companyRecords++;
            } else if (record.company_id === null) {
              orphanRecords++;
            }
          });
        }
      });

      // RLS está funcionando se só vemos registros da nossa empresa
      const isIsolated = companyRecords > 0 && orphanRecords === 0 && totalRecords === companyRecords;

      setStatus({
        isIsolated,
        totalRecords,
        companyRecords,
        orphanRecords
      });

      console.log('✅ Verificação de integridade concluída:', {
        isIsolated,
        totalRecords,
        companyRecords,
        orphanRecords
      });

    } catch (error) {
      console.error('💥 Erro na verificação de integridade:', error);
      setStatus({
        isIsolated: false,
        totalRecords: 0,
        companyRecords: 0,
        orphanRecords: 0,
        error: 'Erro na verificação de integridade'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (status.error) return status.error;
    if (status.isIsolated) return `Isolamento ativo: ${status.companyRecords} registros da empresa`;
    if (status.orphanRecords > 0) return `⚠️ ${status.orphanRecords} registros órfãos encontrados`;
    if (status.totalRecords === 0) return 'Nenhum dado encontrado';
    return `${status.companyRecords}/${status.totalRecords} registros da empresa`;
  };

  return {
    status,
    loading,
    checkDataIntegrity,
    getStatusMessage
  };
};
