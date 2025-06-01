
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { EnhancedExpenseForm } from './EnhancedExpenseForm';

interface ExpenseFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onCancel }) => {
  const [useEnhancedForm, setUseEnhancedForm] = useState(true);

  if (useEnhancedForm) {
    return <EnhancedExpenseForm onSave={onSave} onCancel={onCancel} />;
  }

  // Fallback para o formulário simples (mantido para compatibilidade)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Formulário Simplificado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">
            O formulário simplificado não está mais disponível. 
            Use o formulário completo para melhor controle de despesas.
          </p>
          <Button onClick={() => setUseEnhancedForm(true)}>
            Usar Formulário Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
