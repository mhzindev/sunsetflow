
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { TransactionViewModal } from './TransactionViewModal';
import { TransactionEditModal } from './TransactionEditModal';
import { supabase } from '@/integrations/supabase/client';
import { useToastFeedback } from '@/hooks/useToastFeedback';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  employeeName: string;
  receipt?: string;
  tags?: string[];
  method: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onView, onEdit, onDelete }: TransactionListProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showSuccess, showError } = useToastFeedback();

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
    onView(transaction.id);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
    onEdit(transaction.id);
  };

  const handleDelete = async (transactionId: string) => {
    setDeletingId(transactionId);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) {
        console.error('Erro ao excluir transação:', error);
        showError('Erro', 'Não foi possível excluir a transação');
        return;
      }

      showSuccess('Sucesso', 'Transação excluída com sucesso!');
      onDelete(transactionId);
      // Recarregar a página ou atualizar a lista
      window.location.reload();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      showError('Erro', 'Erro inesperado ao excluir transação');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      income: { label: 'Receita', className: 'bg-green-100 text-green-800' },
      expense: { label: 'Despesa', className: 'bg-red-100 text-red-800' }
    };
    
    const typeConfig = config[type as keyof typeof config];
    return <Badge className={typeConfig.className}>{typeConfig.label}</Badge>;
  };

  // Função corrigida para lidar com valores inválidos
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      console.warn('TransactionList formatCurrency: Valor inválido:', value);
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Nenhuma transação encontrada
        </h3>
        <p className="text-gray-500">
          As transações aparecerão aqui quando forem criadas.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {getTypeBadge(transaction.type)}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  {getStatusBadge(transaction.status)}
                </TableCell>
                <TableCell>{transaction.employeeName}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(transaction)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deletingId === transaction.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(transaction.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionViewModal
        transaction={selectedTransaction}
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedTransaction(null);
        }}
      />

      <TransactionEditModal
        transaction={selectedTransaction}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onTransactionUpdated={() => {
          // Recarregar a página ou atualizar a lista
          window.location.reload();
        }}
      />
    </>
  );
};
