
import jsPDF from 'jspdf';
import { Transaction } from '@/types/transaction';
import { Payment } from '@/types/payment';

interface ReportData {
  title: string;
  period: string;
  data: any;
  summary?: any;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  private formatCurrency(amount: number): string {
    return `R$ ${amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }

  private addHeader(title: string, period: string) {
    // Logo/empresa
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Sistema Financeiro Empresarial', this.margin, this.currentY);
    
    this.currentY += 15;
    this.doc.setFontSize(16);
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Período: ${period}`, this.margin, this.currentY);
    
    this.currentY += 5;
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, this.margin, this.currentY);
    
    this.currentY += 15;
    this.addLine();
  }

  private addLine() {
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  private checkPageBreak() {
    if (this.currentY > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addSummarySection(summary: any) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Resumo Executivo', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');

    Object.entries(summary).forEach(([key, value]) => {
      this.checkPageBreak();
      this.doc.text(`${key}: ${value}`, this.margin + 5, this.currentY);
      this.currentY += 7;
    });

    this.currentY += 10;
    this.addLine();
  }

  private addTableHeader(headers: string[]) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const colWidth = (170) / headers.length;
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * colWidth), this.currentY);
    });
    
    this.currentY += 7;
    this.addLine();
  }

  private addTableRow(data: string[]) {
    this.checkPageBreak();
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    const colWidth = (170) / data.length;
    data.forEach((cell, index) => {
      const text = cell.length > 25 ? cell.substring(0, 22) + '...' : cell;
      this.doc.text(text, this.margin + (index * colWidth), this.currentY);
    });
    
    this.currentY += 6;
  }

  generateFinancialReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório Financeiro - DRE e Balanço', period);

    const income = transactions.filter(t => t.type === 'income' && t.status === 'completed');
    const expenses = transactions.filter(t => t.type === 'expense' && t.status === 'completed');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    this.addSummarySection({
      'Total de Receitas': this.formatCurrency(totalIncome),
      'Total de Despesas': this.formatCurrency(totalExpenses),
      'Lucro Líquido': this.formatCurrency(netProfit),
      'Margem de Lucro': `${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : '0'}%`,
      'Total de Transações': `${transactions.length}`
    });

    // Tabela de receitas
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Receitas por Categoria', this.margin, this.currentY);
    this.currentY += 10;

    this.addTableHeader(['Categoria', 'Qtd', 'Valor Total', 'Valor Médio']);
    
    const incomeByCategory = income.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { count: 0, total: 0 };
      acc[t.category].count++;
      acc[t.category].total += t.amount;
      return acc;
    }, {} as any);

    Object.entries(incomeByCategory).forEach(([category, data]: [string, any]) => {
      this.addTableRow([
        category,
        data.count.toString(),
        this.formatCurrency(data.total),
        this.formatCurrency(data.total / data.count)
      ]);
    });

    this.currentY += 15;

    // Tabela de despesas
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Despesas por Categoria', this.margin, this.currentY);
    this.currentY += 10;

    this.addTableHeader(['Categoria', 'Qtd', 'Valor Total', 'Valor Médio']);
    
    const expensesByCategory = expenses.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { count: 0, total: 0 };
      acc[t.category].count++;
      acc[t.category].total += t.amount;
      return acc;
    }, {} as any);

    Object.entries(expensesByCategory).forEach(([category, data]: [string, any]) => {
      this.addTableRow([
        category,
        data.count.toString(),
        this.formatCurrency(data.total),
        this.formatCurrency(data.total / data.count)
      ]);
    });

    return this.doc;
  }

  generateCashFlowReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório de Fluxo de Caixa', period);

    const dailyFlow = transactions.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString();
      if (!acc[date]) acc[date] = { income: 0, expenses: 0 };
      
      if (t.status === 'completed') {
        if (t.type === 'income') acc[date].income += t.amount;
        else acc[date].expenses += t.amount;
      }
      return acc;
    }, {} as any);

    const totalIncome = Object.values(dailyFlow).reduce((sum: number, day: any) => sum + (day.income || 0), 0);
    const totalExpenses = Object.values(dailyFlow).reduce((sum: number, day: any) => sum + (day.expenses || 0), 0);
    const maxDailyIncome = Math.max(...Object.values(dailyFlow).map((d: any) => d.income || 0));
    const maxDailyExpenses = Math.max(...Object.values(dailyFlow).map((d: any) => d.expenses || 0));

    this.addSummarySection({
      'Total de Entradas': this.formatCurrency(totalIncome),
      'Total de Saídas': this.formatCurrency(totalExpenses),
      'Fluxo Líquido': this.formatCurrency(totalIncome - totalExpenses),
      'Maior Entrada Diária': this.formatCurrency(maxDailyIncome),
      'Maior Saída Diária': this.formatCurrency(maxDailyExpenses)
    });

    this.addTableHeader(['Data', 'Entradas', 'Saídas', 'Saldo Diário']);
    
    Object.entries(dailyFlow)
      .sort(([a], [b]) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
      .forEach(([date, flow]: [string, any]) => {
        const dailyBalance = (flow.income || 0) - (flow.expenses || 0);
        this.addTableRow([
          date,
          this.formatCurrency(flow.income || 0),
          this.formatCurrency(flow.expenses || 0),
          this.formatCurrency(dailyBalance)
        ]);
      });

    return this.doc;
  }

  generatePaymentsReport(payments: Payment[], period: string) {
    this.addHeader('Relatório de Pagamentos', period);

    const completed = payments.filter(p => p.status === 'completed');
    const pending = payments.filter(p => p.status === 'pending');
    const overdue = payments.filter(p => p.status === 'overdue');

    const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = overdue.reduce((sum, p) => sum + p.amount, 0);

    this.addSummarySection({
      'Total Pago': this.formatCurrency(totalPaid),
      'Total Pendente': this.formatCurrency(totalPending),
      'Total em Atraso': this.formatCurrency(totalOverdue),
      'Pagamentos Concluídos': completed.length.toString(),
      'Pagamentos Pendentes': pending.length.toString(),
      'Pagamentos Atrasados': overdue.length.toString()
    });

    this.addTableHeader(['Prestador', 'Valor', 'Status', 'Vencimento']);
    
    payments
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .forEach(payment => {
        this.addTableRow([
          payment.providerName,
          this.formatCurrency(payment.amount),
          payment.status === 'completed' ? 'Pago' : 
          payment.status === 'pending' ? 'Pendente' : 
          payment.status === 'overdue' ? 'Atrasado' : payment.status,
          new Date(payment.dueDate).toLocaleDateString()
        ]);
      });

    return this.doc;
  }

  generateProvidersReport(payments: Payment[], period: string) {
    this.addHeader('Relatório por Prestador', period);

    const providerStats = payments.reduce((acc, p) => {
      if (!acc[p.providerName]) {
        acc[p.providerName] = {
          totalPaid: 0,
          totalPending: 0,
          completedCount: 0,
          pendingCount: 0,
          overdueCount: 0
        };
      }

      if (p.status === 'completed') {
        acc[p.providerName].totalPaid += p.amount;
        acc[p.providerName].completedCount++;
      } else if (p.status === 'pending') {
        acc[p.providerName].totalPending += p.amount;
        acc[p.providerName].pendingCount++;
      } else if (p.status === 'overdue') {
        acc[p.providerName].totalPending += p.amount;
        acc[p.providerName].overdueCount++;
      }

      return acc;
    }, {} as any);

    const totalProviders = Object.keys(providerStats).length;
    const totalPaid = Object.values(providerStats).reduce((sum: number, stats: any) => sum + (stats.totalPaid || 0), 0);
    const totalPending = Object.values(providerStats).reduce((sum: number, stats: any) => sum + (stats.totalPending || 0), 0);

    this.addSummarySection({
      'Total de Prestadores': totalProviders.toString(),
      'Total Pago': this.formatCurrency(totalPaid),
      'Total Pendente': this.formatCurrency(totalPending),
      'Média por Prestador': this.formatCurrency(totalProviders > 0 ? totalPaid / totalProviders : 0)
    });

    this.addTableHeader(['Prestador', 'Valor Pago', 'Valor Pendente', 'Pagamentos']);
    
    Object.entries(providerStats)
      .sort(([,a], [,b]) => (b as any).totalPaid - (a as any).totalPaid)
      .forEach(([provider, stats]: [string, any]) => {
        this.addTableRow([
          provider,
          this.formatCurrency(stats.totalPaid || 0),
          this.formatCurrency(stats.totalPending || 0),
          `${stats.completedCount}/${stats.pendingCount + stats.overdueCount + stats.completedCount}`
        ]);
      });

    return this.doc;
  }

  generateExpensesReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório de Despesas por Funcionário e Missão', period);

    const expenses = transactions.filter(t => t.type === 'expense' && t.status === 'completed');
    const employeeExpenses = expenses.reduce((acc, t) => {
      if (!acc[t.userName]) {
        acc[t.userName] = {
          total: 0,
          byCategory: {},
          count: 0
        };
      }

      acc[t.userName].total += t.amount;
      acc[t.userName].count++;
      
      if (!acc[t.userName].byCategory[t.category]) {
        acc[t.userName].byCategory[t.category] = 0;
      }
      acc[t.userName].byCategory[t.category] += t.amount;

      return acc;
    }, {} as any);

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const topEmployee = Object.entries(employeeExpenses)
      .sort(([,a], [,b]) => (b as any).total - (a as any).total)[0];

    this.addSummarySection({
      'Total de Despesas': this.formatCurrency(totalExpenses),
      'Total de Funcionários': Object.keys(employeeExpenses).length.toString(),
      'Maior Gastador': topEmployee ? `${topEmployee[0]} - ${this.formatCurrency((topEmployee[1] as any).total)}` : 'N/A',
      'Despesa Média por Funcionário': this.formatCurrency(Object.keys(employeeExpenses).length > 0 ? totalExpenses / Object.keys(employeeExpenses).length : 0)
    });

    this.addTableHeader(['Funcionário', 'Total Gasto', 'Qtd Despesas', 'Média']);
    
    Object.entries(employeeExpenses)
      .sort(([,a], [,b]) => (b as any).total - (a as any).total)
      .forEach(([employee, stats]: [string, any]) => {
        this.addTableRow([
          employee,
          this.formatCurrency(stats.total || 0),
          (stats.count || 0).toString(),
          this.formatCurrency(stats.count > 0 ? stats.total / stats.count : 0)
        ]);
      });

    return this.doc;
  }

  generateReimbursementsReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório de Reembolsos', period);

    const reimbursements = transactions.filter(t => 
      t.type === 'expense' && 
      (t.category === 'fuel' || t.category === 'accommodation' || t.category === 'meals')
    );

    const pending = reimbursements.filter(t => t.status === 'pending');
    const completed = reimbursements.filter(t => t.status === 'completed');

    const totalPending = pending.reduce((sum, t) => sum + t.amount, 0);
    const totalCompleted = completed.reduce((sum, t) => sum + t.amount, 0);

    this.addSummarySection({
      'Total Pendente': this.formatCurrency(totalPending),
      'Total Aprovado': this.formatCurrency(totalCompleted),
      'Reembolsos Pendentes': pending.length.toString(),
      'Reembolsos Aprovados': completed.length.toString()
    });

    this.addTableHeader(['Funcionário', 'Categoria', 'Valor', 'Status', 'Data']);
    
    reimbursements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(transaction => {
        this.addTableRow([
          transaction.userName,
          transaction.category,
          this.formatCurrency(transaction.amount),
          transaction.status === 'completed' ? 'Aprovado' : 'Pendente',
          new Date(transaction.date).toLocaleDateString()
        ]);
      });

    return this.doc;
  }

  generateTaxReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório Fiscal para Contabilidade', period);

    const income = transactions.filter(t => t.type === 'income' && t.status === 'completed');
    const expenses = transactions.filter(t => t.type === 'expense' && t.status === 'completed');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const taxableIncome = totalIncome - totalExpenses;

    // Estimativa de impostos (simplificada)
    const estimatedTax = taxableIncome * 0.15; // 15% aproximado

    this.addSummarySection({
      'Receita Bruta': this.formatCurrency(totalIncome),
      'Despesas Dedutíveis': this.formatCurrency(totalExpenses),
      'Lucro Tributável': this.formatCurrency(taxableIncome),
      'Imposto Estimado (15%)': this.formatCurrency(estimatedTax)
    });

    // Detalhamento por método de pagamento
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Movimentação por Método de Pagamento', this.margin, this.currentY);
    this.currentY += 10;

    this.addTableHeader(['Método', 'Receitas', 'Despesas', 'Líquido']);
    
    const paymentMethods = ['pix', 'transfer', 'credit_card', 'debit_card', 'cash'];
    paymentMethods.forEach(method => {
      const methodIncome = income.filter(t => t.method === method).reduce((sum, t) => sum + t.amount, 0);
      const methodExpenses = expenses.filter(t => t.method === method).reduce((sum, t) => sum + t.amount, 0);
      const methodNet = methodIncome - methodExpenses;

      this.addTableRow([
        method.toUpperCase(),
        this.formatCurrency(methodIncome),
        this.formatCurrency(methodExpenses),
        this.formatCurrency(methodNet)
      ]);
    });

    return this.doc;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}
