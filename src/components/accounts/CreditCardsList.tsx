
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard as CreditCardType } from '@/types/account';
import { CreditCard, Edit, Eye, MoreVertical, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreditCardsListProps {
  cards: CreditCardType[];
}

export const CreditCardsList = ({ cards }: CreditCardsListProps) => {
  const getBrandColor = (brand: string) => {
    const colors = {
      visa: 'bg-blue-100 text-blue-800',
      mastercard: 'bg-red-100 text-red-800',
      elo: 'bg-yellow-100 text-yellow-800',
      amex: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[brand as keyof typeof colors] || colors.other;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage <= 30) return 'text-green-600';
    if (percentage <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number | undefined) => {
    return (value || 0).toLocaleString('pt-BR');
  };

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            Nenhum cartão cadastrado
          </h3>
          <p className="text-slate-500">
            Adicione seus cartões de crédito para controlar limites e gastos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const limit = card.limit || 0;
        const usedLimit = card.usedLimit || 0;
        const availableLimit = card.availableLimit || 0;
        const utilizationPercentage = limit > 0 ? (usedLimit / limit) * 100 : 0;
        
        return (
          <Card key={card.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <h4 className="text-lg font-semibold text-slate-800">
                      {card.name || 'Cartão sem nome'}
                    </h4>
                    <Badge className={getBrandColor(card.brand)}>
                      {(card.brand || 'other').toUpperCase()}
                    </Badge>
                    {!card.isActive && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Banco</p>
                      <p className="font-medium text-slate-800">{card.bank || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Final do Cartão</p>
                      <p className="font-medium text-slate-800">**** {card.cardNumber || '0000'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Vencimento / Fechamento</p>
                      <p className="font-medium text-slate-800 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {card.dueDate || 'N/A'} / {card.closingDate || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Utilização do Limite</span>
                        <span className={`font-semibold ${getUtilizationColor(utilizationPercentage)}`}>
                          {utilizationPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={utilizationPercentage} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Limite Total</p>
                        <p className="font-bold text-slate-800">
                          R$ {formatCurrency(limit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Utilizado</p>
                        <p className="font-bold text-red-600">
                          R$ {formatCurrency(usedLimit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Disponível</p>
                        <p className="font-bold text-green-600">
                          R$ {formatCurrency(availableLimit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
