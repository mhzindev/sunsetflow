
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentTableRow } from './PaymentTableRow';
import { Payment } from '@/types/payment';

interface PaymentTableProps {
  payments: Payment[];
  onPaymentUpdate?: () => void;
}

export const PaymentTable = ({ payments, onPaymentUpdate }: PaymentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prestador</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Urgência</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <PaymentTableRow 
            key={payment.id} 
            payment={payment} 
            onPaymentUpdate={onPaymentUpdate}
          />
        ))}
      </TableBody>
    </Table>
  );
};
