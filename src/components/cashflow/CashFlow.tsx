import React, { useState } from 'react';
import { CashFlowProjections } from './CashFlowProjections';
import { CashFlowAnalysis } from './CashFlowAnalysis';
import { ClientManager } from '@/components/clients/ClientManager';

export const CashFlow = () => {
  const [activeTab, setActiveTab] = useState('projections');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projections':
        return <CashFlowProjections />;
      case 'analysis':
        return <CashFlowAnalysis />;
      case 'clients':
        return <ClientManager />;
      default:
        return <CashFlowProjections />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Acompanhe projeções, análises e gestão de clientes
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projections')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Projeções
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análise Financeira
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'clients'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gestão de Clientes
          </button>
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
};
