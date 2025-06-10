
import { useFinancialSimplified } from '@/contexts/FinancialContextSimplified';
import { PDFReportGenerator } from '@/utils/pdfGenerator';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { useState } from 'react';

export const useReportGenerator = () => {
  const { data } = useFinancialSimplified();
  const { showSuccess, showError } = useToastFeedback();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (type: string, dateRange: { start: string; end: string }) => {
    // Validação de entrada
    if (!dateRange.start || !dateRange.end) {
      showError('Erro de Validação', 'Selecione um período válido para o relatório');
      return;
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (startDate > endDate) {
      showError('Erro de Validação', 'Data inicial deve ser anterior à data final');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Gerando relatório:', type, 'Período:', dateRange);
      
      const generator = new PDFReportGenerator();
      const period = `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
      
      // Filtrar dados por período
      const filteredTransactions = data.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const filteredPayments = data.payments.filter(p => {
        const paymentDate = new Date(p.dueDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      console.log('Dados filtrados - Transações:', filteredTransactions.length, 'Pagamentos:', filteredPayments.length);

      // Verificar se há dados para o período
      if (filteredTransactions.length === 0 && filteredPayments.length === 0) {
        showError('Sem Dados', 'Não há dados para o período selecionado');
        return;
      }

      let filename = '';
      let doc;

      switch (type) {
        case 'financial':
          if (filteredTransactions.length === 0) {
            showError('Sem Dados', 'Não há transações para o período selecionado');
            return;
          }
          doc = generator.generateFinancialReport(filteredTransactions, period);
          filename = `relatorio-financeiro-${Date.now()}.pdf`;
          break;
        
        case 'cashflow':
          if (filteredTransactions.length === 0) {
            showError('Sem Dados', 'Não há transações para o período selecionado');
            return;
          }
          doc = generator.generateCashFlowReport(filteredTransactions, period);
          filename = `fluxo-de-caixa-${Date.now()}.pdf`;
          break;
        
        case 'taxes':
          if (filteredTransactions.length === 0) {
            showError('Sem Dados', 'Não há transações para o período selecionado');
            return;
          }
          doc = generator.generateTaxReport(filteredTransactions, period);
          filename = `relatorio-fiscal-${Date.now()}.pdf`;
          break;
        
        case 'payments':
          if (filteredPayments.length === 0) {
            showError('Sem Dados', 'Não há pagamentos para o período selecionado');
            return;
          }
          doc = generator.generatePaymentsReport(filteredPayments, period);
          filename = `relatorio-pagamentos-${Date.now()}.pdf`;
          break;
        
        case 'providers':
          if (filteredPayments.length === 0) {
            showError('Sem Dados', 'Não há pagamentos de prestadores para o período selecionado');
            return;
          }
          doc = generator.generateProvidersReport(filteredPayments, period);
          filename = `relatorio-prestadores-${Date.now()}.pdf`;
          break;
        
        case 'travel-expenses':
          const travelTransactions = filteredTransactions.filter(t => 
            t.category === 'fuel' || t.category === 'accommodation'
          );
          if (travelTransactions.length === 0) {
            showError('Sem Dados', 'Não há despesas de viagem para o período selecionado');
            return;
          }
          doc = generator.generateExpensesReport(travelTransactions, period);
          filename = `relatorio-despesas-viagem-${Date.now()}.pdf`;
          break;
        
        case 'reimbursements':
          const reimbursementTransactions = filteredTransactions.filter(t => 
            t.type === 'expense' && t.status === 'completed'
          );
          if (reimbursementTransactions.length === 0) {
            showError('Sem Dados', 'Não há reembolsos para o período selecionado');
            return;
          }
          doc = generator.generateReimbursementsReport(reimbursementTransactions, period);
          filename = `relatorio-reembolsos-${Date.now()}.pdf`;
          break;
        
        default:
          throw new Error(`Tipo de relatório não reconhecido: ${type}`);
      }

      // Simular delay para mostrar feedback de loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      generator.save(filename);
      
      showSuccess(
        'Relatório Gerado com Sucesso',
        `O arquivo ${filename} foi baixado`
      );

      console.log('Relatório gerado com sucesso:', filename);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showError(
        'Erro na Geração do Relatório',
        error instanceof Error ? error.message : 'Não foi possível gerar o relatório. Tente novamente.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return { 
    generateReport,
    isGenerating
  };
};
