
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingRevenuesManager } from './PendingRevenuesManager';
import { ConfirmedRevenuesManager } from './ConfirmedRevenuesManager';
import { usePendingRevenues } from '@/hooks/usePendingRevenues';
import { useConfirmedRevenues } from '@/hooks/useConfirmedRevenues';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/dateUtils';

export const RevenueManager = () => {
  const { pendingRevenues } = usePendingRevenues();
  const { confirmedRevenues } = useConfirmedRevenues();

  const pendingTotal = pendingRevenues
    .filter(r => r.status === 'pending')
    .reduce((sum, revenue) => sum + revenue.total_amount, 0);
  
  const confirmedTotal = confirmedRevenues
    .reduce((sum, revenue) => sum + revenue.total_amount, 0);

  const totalRevenue = pendingTotal + confirmedTotal;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Pendentes + Confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRevenues.filter(r => r.status === 'pending').length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(confirmedTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedRevenues.length} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue > 0 ? Math.round((confirmedTotal / totalRevenue) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Pendente → Confirmada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para os dois tipos de receita */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Receitas Pendentes
            {pendingRevenues.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {pendingRevenues.filter(r => r.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Receitas Confirmadas
            {confirmedRevenues.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {confirmedRevenues.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingRevenuesManager />
        </TabsContent>

        <TabsContent value="confirmed">
          <ConfirmedRevenuesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
