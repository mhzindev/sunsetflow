
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const CashFlowChart = () => {
  const monthlyData = [
    { month: 'Jan', entrada: 45000, saida: 32000, saldo: 13000 },
    { month: 'Fev', entrada: 52000, saida: 38000, saldo: 14000 },
    { month: 'Mar', entrada: 48000, saida: 35000, saldo: 13000 },
    { month: 'Abr', entrada: 58000, saida: 42000, saldo: 16000 },
    { month: 'Mai', entrada: 61000, saida: 45000, saldo: 16000 },
    { month: 'Jun', entrada: 67000, saida: 48000, saldo: 19000 }
  ];

  const projectionData = [
    { periodo: 'Sem 1', projetado: 12500, realizado: 11800 },
    { periodo: 'Sem 2', projetado: 15000, realizado: 14200 },
    { periodo: 'Sem 3', projetado: 18000, realizado: null },
    { periodo: 'Sem 4', projetado: 22000, realizado: null }
  ];

  const chartConfig = {
    entrada: {
      label: "Entradas",
      color: "#10b981",
    },
    saida: {
      label: "Saídas", 
      color: "#ef4444",
    },
    saldo: {
      label: "Saldo",
      color: "#3b82f6",
    },
    projetado: {
      label: "Projetado",
      color: "#8b5cf6",
    },
    realizado: {
      label: "Realizado",
      color: "#10b981",
    }
  };

  return (
    <div className="space-y-6">
      {/* Fluxo de Caixa Mensal */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Fluxo de Caixa Mensal</h4>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="entrada" fill="var(--color-entrada)" />
              <Bar dataKey="saida" fill="var(--color-saida)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Evolução do Saldo */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Evolução do Saldo</h4>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-saldo)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-saldo)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Projetado vs Realizado */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Projetado vs Realizado</h4>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="projetado" 
                stroke="var(--color-projetado)" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="realizado" 
                stroke="var(--color-realizado)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-realizado)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>
    </div>
  );
};
