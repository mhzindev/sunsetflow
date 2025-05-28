
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const MissionManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    assignedEmployees: [] as string[]
  });

  const mockMissions = [
    {
      id: '1',
      title: 'Instalação - Cliente ABC',
      client: 'ABC Transportes',
      location: 'São Paulo/SP',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'completed',
      assignedEmployees: ['Carlos Santos', 'Ana Silva'],
      totalExpenses: 1180.50
    },
    {
      id: '2',
      title: 'Manutenção - Cliente XYZ',
      client: 'XYZ Logística',
      location: 'Rio de Janeiro/RJ',
      startDate: '2024-01-20',
      endDate: '2024-01-21',
      status: 'in-progress',
      assignedEmployees: ['João Oliveira'],
      totalExpenses: 690.40
    },
    {
      id: '3',
      title: 'Instalação - Cliente DEF',
      client: 'DEF Cargas',
      location: 'Belo Horizonte/MG',
      startDate: '2024-01-25',
      endDate: '2024-01-26',
      status: 'planned',
      assignedEmployees: ['Carlos Santos'],
      totalExpenses: 0
    }
  ];

  const mockEmployees = [
    { id: '1', name: 'Ana Silva (Proprietária)' },
    { id: '2', name: 'Carlos Santos' },
    { id: '3', name: 'João Oliveira' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || colors.planned;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planned: 'Planejada',
      'in-progress': 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status as keyof typeof labels] || 'Planejada';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mission created:', formData);
    setShowForm(false);
    setFormData({
      title: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      assignedEmployees: []
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Gerenciar Missões</h4>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Nova Missão'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título da Missão</Label>
                <Input
                  id="title"
                  placeholder="Ex: Instalação - Cliente ABC"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Input
                  id="client"
                  placeholder="Nome do cliente"
                  value={formData.client}
                  onChange={(e) => setFormData({...formData, client: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                placeholder="Cidade/Estado"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data de Término (Prevista)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Criar Missão
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Missão</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Funcionários</TableHead>
              <TableHead>Total Despesas</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMissions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell className="font-medium">{mission.title}</TableCell>
                <TableCell>{mission.client}</TableCell>
                <TableCell>{mission.location}</TableCell>
                <TableCell>
                  {new Date(mission.startDate).toLocaleDateString('pt-BR')}
                  {mission.endDate && ` - ${new Date(mission.endDate).toLocaleDateString('pt-BR')}`}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(mission.status)}>
                    {getStatusLabel(mission.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {mission.assignedEmployees.map((employee, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {employee}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  R$ {mission.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">Ver</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
