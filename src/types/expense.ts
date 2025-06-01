
export interface Expense {
  id: string;
  missionId: string;
  employeeId: string;
  employeeName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isAdvanced: boolean;
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  reimbursedAt?: string;
  receipt?: string;
  // Campos específicos para hospedagem
  accommodationDetails?: {
    actualCost: number; // Valor realmente gasto
    reimbursementAmount: number; // Valor da nota de ressarcimento
    netAmount: number; // Valor líquido (reimbursementAmount - actualCost)
    outsourcingCompany?: string; // Nome da empresa terceirizada
    invoiceNumber?: string; // Número da nota fiscal
  };
}
