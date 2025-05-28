
export interface Employee {
  id: string;
  name: string;
  role: 'owner' | 'technician' | 'manager';
}

export interface Mission {
  id: string;
  title: string;
  client: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'in-progress' | 'completed';
  assignedEmployees: string[];
}

export interface TravelExpense {
  id: string;
  missionId: string;
  employeeId: string;
  category: 'fuel' | 'accommodation' | 'meals' | 'transportation' | 'materials' | 'other';
  description: string;
  amount: number;
  date: string;
  receipt?: string;
  isAdvanced: boolean; // Se foi adiantamento da empresa
  status: 'pending' | 'approved' | 'reimbursed';
  submittedBy: string;
  submittedAt: string;
}

export type ExpenseCategory = TravelExpense['category'];
export type ExpenseStatus = TravelExpense['status'];
