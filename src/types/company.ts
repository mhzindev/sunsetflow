
export interface Company {
  id: string;
  name: string;
  legalName: string; // Razão social
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  ownerId: string;
}

export interface EmployeeAccessCode {
  id: string;
  code: string;
  companyId: string;
  employeeName: string;
  employeeEmail: string;
  isUsed: boolean;
  createdAt: string;
  expires_at?: string;
  usedAt?: string;
}
