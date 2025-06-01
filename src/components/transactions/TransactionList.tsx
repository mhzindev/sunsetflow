import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface TransactionListProps {
  transactions: Transaction[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onView, onEdit, onDelete }: TransactionListProps) => {
  const { profile } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(transaction.date, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(transaction.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                    {transaction.type === 'income' ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Receita
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Despesa
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(transaction.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {profile?.role === 'owner' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(transaction.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
