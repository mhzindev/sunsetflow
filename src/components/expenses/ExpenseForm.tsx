
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExpenseCategory, ExpenseStatus } from '@/types/expense';

export const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    missionId: '',
    employeeId: '',
    category: 'fuel' as ExpenseCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isAdvanced: false
  });

  const categories = [
    { value: 'fuel', label: 'Combustível', color: 'bg-orange-100 text-orange-800' },
    { value: 'accommodation', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
    { value: 'meals', label: 'Alimentação', color: 'bg-green-100 text-green-800' },
    { value: 'transportation', label: 'Transporte', color: 'bg-purple-100 text-purple-800' },
    { value: 'materials', label: 'Materiais', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
  ];

  const mockEmployees = [
    { id: '1', name: 'Ana Silva (Proprietária)', role: 'owner' },
    { id: '2', name: 'Carlos Santos', role: 'technician' },
    { id: '3', name: 'João Oliveira', role: 'technician' }
  ];

  const mockMissions = [
    { id: '1', title: 'Instalação - Cliente ABC', location: 'São Paulo/SP' },
    { id: '2', title: 'Manutenção - Cliente XYZ', location: 'Rio de Janeiro/RJ' },
    { id: '3', title: 'Instalação - Cliente DEF', location: 'Belo Horizonte/MG' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Expense submitted:', formData);
    // Aqui seria a lógica para salvar a despesa
  };

  return (
    <Card className="p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-4">Registrar Nova Despesa</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mission">Missão</Label>
            <select
              id="mission"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.missionId}
              onChange={(e) => setFormData({...formData, missionId: e.target.value})}
              required
            >
              <option value="">Selecione uma missão</option>
              {mockMissions.map(mission => (
                <option key={mission.id} value={mission.id}>
                  {mission.title} - {mission.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="employee">Funcionário</Label>
            <select
              id="employee"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Selecione um funcionário</option>
              {mockEmployees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Categoria da Despesa</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(category => (
              <Badge
                key={category.value}
                className={`cursor-pointer ${
                  formData.category === category.value 
                    ? 'bg-blue-600 text-white' 
                    : category.color
                }`}
                onClick={() => setFormData({...formData, category: category.value as ExpenseCategory})}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição da Despesa</Label>
          <Textarea
            id="description"
            placeholder="Descreva a despesa (ex: Combustível para viagem SP, Hospedagem Hotel ABC...)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data da Despesa</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAdvanced"
            checked={formData.isAdvanced}
            onChange={(e) => setFormData({...formData, isAdvanced: e.target.checked})}
          />
          <Label htmlFor="isAdvanced">
            Esta é uma despesa adiantada pela empresa
          </Label>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Registrar Despesa
          </Button>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};
