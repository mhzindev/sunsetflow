
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
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  completedAt?: string;
  receipt?: string;
  // Campos específicos para hospedagem
  accommodationDetails?: {
    actualCost: number; // Valor realmente gasto pela empresa
    invoiceAmount: number; // Valor da nota fiscal para ressarcimento
    netAmount: number; // Valor líquido (invoiceAmount - actualCost)
    outsourcingCompany?: string; // Nome da empresa terceirizada
    invoiceNumber?: string; // Número da nota fiscal
  };
  // Campos específicos para deslocamento
  travelDetails?: {
    kilometers: number; // Distância em KM
    ratePerKm: number; // Valor por KM
    totalRevenue: number; // Total da receita (km * rate)
  };
}

export interface ExpenseFormData {
  mission_id?: string;
  category: string;
  description: string;
  amount?: number;
  invoice_amount?: number; // Para hospedagem - valor da nota
  date: string;
  is_advanced?: boolean;
  receipt?: string;
  travel_km?: number; // Para deslocamento
  travel_km_rate?: number; // Para deslocamento
  travel_total_value?: number; // Para deslocamento - calculado
}
