import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCard } from '@/components/MetricCard';
import { ChartContainer } from '@/components/ChartContainer';
import { PatientTable } from '@/components/PatientTable';

// Mock data para demonstração
const mockPatients = [
  {
    id: '1',
    name: 'Maria Silva',
    acquisitionDate: '2024-01-15',
    source: 'Google Ads',
    ltv: 2450.00,
    status: 'active' as const,
    lastVisit: '2024-01-10'
  },
  {
    id: '2',
    name: 'João Santos',
    acquisitionDate: '2024-01-12',
    source: 'Facebook Ads',
    ltv: 1850.00,
    status: 'active' as const,
    lastVisit: '2024-01-08'
  },
  {
    id: '3',
    name: 'Ana Costa',
    acquisitionDate: '2024-01-10',
    source: 'Instagram Ads',
    ltv: 3200.00,
    status: 'inactive' as const,
    lastVisit: '2024-01-05'
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    acquisitionDate: '2024-01-08',
    source: 'Google Ads',
    ltv: 1650.00,
    status: 'active' as const,
    lastVisit: '2024-01-07'
  }
];

const Index = () => {
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader
          selectedClinic={selectedClinic}
          onClinicChange={setSelectedClinic}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="LTV Médio"
            value={2287.50}
            change="+12.5%"
            trend="up"
            variant="success"
            currency
            description="Valor médio por paciente adquirido"
            icon={
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />

          <MetricCard
            title="CAC Médio"
            value={285.00}
            change="-8.2%"
            trend="down"
            variant="success"
            currency
            description="Custo médio de aquisição por paciente"
            icon={
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />

          <MetricCard
            title="ROI"
            value="702%"
            change="+24.1%"
            trend="up"
            variant="success"
            description="Retorno sobre investimento em marketing"
            icon={
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />

          <MetricCard
            title="Pacientes Ativos"
            value={127}
            change="+15 novos"
            trend="up"
            description="Pacientes com consultas nos últimos 30 dias"
            icon={
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer
            title="Evolução do LTV"
            description="Lifetime Value médio por mês dos últimos 6 meses"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Gráfico em desenvolvimento</p>
                <p className="text-sm">Integração com Recharts será implementada</p>
              </div>
            </div>
          </ChartContainer>

          <ChartContainer
            title="ROI por Fonte"
            description="Retorno sobre investimento por canal de marketing"
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p>Gráfico em desenvolvimento</p>
                <p className="text-sm">Gráfico de pizza com distribuição de ROI</p>
              </div>
            </div>
          </ChartContainer>
        </div>

        {/* Tabela de Pacientes */}
        <PatientTable patients={mockPatients} />
      </div>
    </div>
  );
};

export default Index;
