
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { usePendingRevenues } from "@/hooks/usePendingRevenues";
import { formatCurrency } from "@/utils/dateUtils";

interface PendingRevenuesCardProps {
  onNavigate: (section: string) => void;
}

export const PendingRevenuesCard = ({ onNavigate }: PendingRevenuesCardProps) => {
  const { pendingRevenues, loading } = usePendingRevenues();

  // Filtrar apenas receitas com status 'pending'
  const activePendingRevenues = pendingRevenues.filter(revenue => 
    revenue.status === 'pending'
  );

  const totalPending = activePendingRevenues.reduce((sum, revenue) => 
    sum + revenue.total_amount, 0
  );

  const urgentCount = activePendingRevenues.filter(revenue => {
    const dueDate = new Date(revenue.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Vence em 7 dias ou menos
  }).length;

  if (loading) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Carregando...</div>
          <p className="text-xs text-muted-foreground">
            Buscando receitas pendentes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onNavigate('revenues-pending')}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Receitas Pendentes</CardTitle>
        <Clock className="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-yellow-600">
          {formatCurrency(totalPending)}
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {activePendingRevenues.length} receita{activePendingRevenues.length !== 1 ? 's' : ''} pendente{activePendingRevenues.length !== 1 ? 's' : ''}
          </p>
          {urgentCount > 0 && (
            <div className="flex items-center text-xs text-orange-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {urgentCount} urgente{urgentCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
