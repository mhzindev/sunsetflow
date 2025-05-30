
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Payment } from '@/types/payment';
import { PaymentTableRow } from './PaymentTableRow';

interface PaymentTableProps {
  payments: Payment[];
}

export const PaymentTable = ({ payments }: PaymentTableProps) => {
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
          <PaymentTableRow key={payment.id} payment={payment} />
        ))}
      </TableBody>
    </Table>
  );
};
