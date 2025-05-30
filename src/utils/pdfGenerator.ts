
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
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, this.margin, this.currentY);
    
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
      'Total de Receitas': `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total de Despesas': `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Lucro Líquido': `R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
        `R$ ${data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${(data.total / data.count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
        `R$ ${data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${(data.total / data.count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);
    });

    return this.doc;
  }

  generateCashFlowReport(transactions: Transaction[], period: string) {
    this.addHeader('Relatório de Fluxo de Caixa', period);

    const dailyFlow = transactions.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('pt-BR');
      if (!acc[date]) acc[date] = { income: 0, expenses: 0 };
      
      if (t.status === 'completed') {
        if (t.type === 'income') acc[date].income += t.amount;
        else acc[date].expenses += t.amount;
      }
      return acc;
    }, {} as any);

    const totalIncome = Object.values(dailyFlow).reduce((sum: number, day: any) => sum + day.income, 0);
    const totalExpenses = Object.values(dailyFlow).reduce((sum: number, day: any) => sum + day.expenses, 0);

    this.addSummarySection({
      'Total de Entradas': `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total de Saídas': `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Fluxo Líquido': `R$ ${(totalIncome - totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Maior Entrada Diária': `R$ ${Math.max(...Object.values(dailyFlow).map((d: any) => d.income)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Maior Saída Diária': `R$ ${Math.max(...Object.values(dailyFlow).map((d: any) => d.expenses)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });

    this.addTableHeader(['Data', 'Entradas', 'Saídas', 'Saldo Diário']);
    
    Object.entries(dailyFlow)
      .sort(([a], [b]) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
      .forEach(([date, flow]: [string, any]) => {
        const dailyBalance = flow.income - flow.expenses;
        this.addTableRow([
          date,
          `R$ ${flow.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${flow.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${dailyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
      'Total Pago': `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total Pendente': `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total em Atraso': `R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
          `R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          payment.status === 'completed' ? 'Pago' : 
          payment.status === 'pending' ? 'Pendente' : 
          payment.status === 'overdue' ? 'Atrasado' : payment.status,
          new Date(payment.dueDate).toLocaleDateString('pt-BR')
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
    const totalPaid = Object.values(providerStats).reduce((sum: number, stats: any) => sum + stats.totalPaid, 0);
    const totalPending = Object.values(providerStats).reduce((sum: number, stats: any) => sum + stats.totalPending, 0);

    this.addSummarySection({
      'Total de Prestadores': totalProviders.toString(),
      'Total Pago': `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total Pendente': `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Média por Prestador': `R$ ${(totalPaid / totalProviders).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });

    this.addTableHeader(['Prestador', 'Valor Pago', 'Valor Pendente', 'Pagamentos']);
    
    Object.entries(providerStats)
      .sort(([,a], [,b]) => (b as any).totalPaid - (a as any).totalPaid)
      .forEach(([provider, stats]: [string, any]) => {
        this.addTableRow([
          provider,
          `R$ ${stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
      'Total de Despesas': `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total de Funcionários': Object.keys(employeeExpenses).length.toString(),
      'Maior Gastador': topEmployee ? `${topEmployee[0]} - R$ ${(topEmployee[1] as any).total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A',
      'Despesa Média por Funcionário': `R$ ${(totalExpenses / Object.keys(employeeExpenses).length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });

    this.addTableHeader(['Funcionário', 'Total Gasto', 'Qtd Despesas', 'Média']);
    
    Object.entries(employeeExpenses)
      .sort(([,a], [,b]) => (b as any).total - (a as any).total)
      .forEach(([employee, stats]: [string, any]) => {
        this.addTableRow([
          employee,
          `R$ ${stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          stats.count.toString(),
          `R$ ${(stats.total / stats.count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
      'Total Pendente': `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Total Aprovado': `R$ ${totalCompleted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
          `R$ ${transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          transaction.status === 'completed' ? 'Aprovado' : 'Pendente',
          new Date(transaction.date).toLocaleDateString('pt-BR')
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
      'Receita Bruta': `R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Despesas Dedutíveis': `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Lucro Tributável': `R$ ${taxableIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Imposto Estimado (15%)': `R$ ${estimatedTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
        `R$ ${methodIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${methodExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${methodNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);
    });

    return this.doc;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}
