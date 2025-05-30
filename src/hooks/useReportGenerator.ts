
import { useFinancial } from '@/contexts/FinancialContext';
import { PDFReportGenerator } from '@/utils/pdfGenerator';
import { useToastFeedback } from '@/hooks/useToastFeedback';

export const useReportGenerator = () => {
  const { data } = useFinancial();
  const { showSuccess, showError } = useToastFeedback();

  const generateReport = async (type: string, dateRange: { start: string; end: string }) => {
    try {
      const generator = new PDFReportGenerator();
      const period = `${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`;
      
      // Filtrar dados por período
      const filteredTransactions = data.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const filteredPayments = data.payments.filter(p => {
        const paymentDate = new Date(p.dueDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      let filename = '';
      let doc;

      switch (type) {
        case 'financial':
          doc = generator.generateFinancialReport(filteredTransactions, period);
          filename = `relatorio-financeiro-${new Date().getTime()}.pdf`;
          break;
        
        case 'cashflow':
          doc = generator.generateCashFlowReport(filteredTransactions, period);
          filename = `fluxo-de-caixa-${new Date().getTime()}.pdf`;
          break;
        
        case 'taxes':
          doc = generator.generateTaxReport(filteredTransactions, period);
          filename = `relatorio-fiscal-${new Date().getTime()}.pdf`;
          break;
        
        case 'payments':
          doc = generator.generatePaymentsReport(filteredPayments, period);
          filename = `relatorio-pagamentos-${new Date().getTime()}.pdf`;
          break;
        
        case 'providers':
          doc = generator.generateProvidersReport(filteredPayments, period);
          filename = `relatorio-prestadores-${new Date().getTime()}.pdf`;
          break;
        
        case 'travel-expenses':
          doc = generator.generateExpensesReport(filteredTransactions, period);
          filename = `relatorio-despesas-${new Date().getTime()}.pdf`;
          break;
        
        case 'reimbursements':
          doc = generator.generateReimbursementsReport(filteredTransactions, period);
          filename = `relatorio-reembolsos-${new Date().getTime()}.pdf`;
          break;
        
        default:
          throw new Error('Tipo de relatório não reconhecido');
      }

      generator.save(filename);
      showSuccess(
        'Relatório Gerado',
        `O relatório foi gerado e baixado com sucesso como ${filename}`
      );

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showError(
        'Erro na Geração',
        'Não foi possível gerar o relatório. Tente novamente.'
      );
    }
  };

  return { generateReport };
};
