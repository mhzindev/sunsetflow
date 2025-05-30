
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowProjections } from './CashFlowProjections';
import { CashFlowChart } from './CashFlowChart';
import { CashFlowAnalysis } from './CashFlowAnalysis';

export const CashFlow = () => {
  const [activeTab, setActiveTab] = useState('projections');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Fluxo de Caixa</h3>
        <p className="text-slate-600 mb-6">
          Visualize projeções de fluxo de caixa, considerando recebimentos previstos 
          entre 30-45 dias e pagamentos programados.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projections">Projeções</TabsTrigger>
            <TabsTrigger value="chart">Gráficos</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="projections" className="mt-6">
            <CashFlowProjections />
          </TabsContent>

          <TabsContent value="chart" className="mt-6">
            <CashFlowChart />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <CashFlowAnalysis />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
