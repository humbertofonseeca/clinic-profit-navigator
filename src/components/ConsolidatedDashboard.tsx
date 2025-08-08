import { Card } from '@/components/ui/card';
interface ConsolidatedDashboardProps {
  selectedPeriod: string;
  selectedClinic: string;
}
export const ConsolidatedDashboard = ({
  selectedPeriod,
  selectedClinic
}: ConsolidatedDashboardProps) => {
  // Mock data - seria substituído por dados reais do Supabase
  const dashboardData = {
    dataInicial: '01/08/2025',
    dataFinal: '08/08/2025',
    investimentoTotal: 50000.00,
    valorUtilizado: 47500.00,
    custoPorPaciente: 285.00,
    custoPorConsulta: 156.50,
    mensagensRecebidas: 2340,
    custoPorMensagem: 20.30,
    faturamentoBruto: 285000.00,
    faturamentoLiquido: 198000.00,
    roas: 5.68,
    roi: 4.17,
    pacientesAdquiridos: 167,
    pacientesAgendados: 142,
    pacientesEfetivados: 118,
    noShow: 24,
    taxaAgendamento: 85.03,
    taxaComparecimento: 83.10,
    taxaNoShow: 16.90,
    ltvMedio: 2850.00,
    cacMedio: 299.40,
    investimento: {
      googleAds: 28500.00,
      facebookAds: 15000.00,
      instagram: 4000.00
    },
    receita: {
      consultas: 156000.00,
      procedimentos: 129000.00
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  const formatNumber = (value: number) => {
    return value.toString();
  };
  const getPeriodText = () => {
    const periods: {
      [key: string]: string;
    } = {
      '7d': '01/08/2025 | Data Final: 08/08/2025',
      '30d': '01/08/2025 | Data Final: 31/08/2025',
      '90d': '01/06/2025 | Data Final: 31/08/2025',
      '1y': '01/08/2024 | Data Final: 31/08/2025'
    };
    return periods[selectedPeriod] || periods['30d'];
  };
  return <div className="w-full max-w-7xl mx-auto space-y-0">
      {/* Header azul */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <h1 className="text-xl font-bold">DASHBOARD CONSOLIDADO - LTV E PERFORMANCE DE MARKETING</h1>
      </div>

      {/* Primeira linha de métricas */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="grid grid-cols-4 gap-0">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Investimento Total</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.investimentoTotal)}</div>
          </div>
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Custo por Mensagem</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.custoPorMensagem)}</div>
          </div>
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Custo por Paciente</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.custoPorPaciente)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground uppercase">LTV Médio</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.ltvMedio)}</div>
          </div>
        </div>
      </div>

      {/* Segunda linha de métricas */}
      <div className="bg-secondary text-secondary-foreground border-t border-border">
        <div className="grid grid-cols-2 gap-0">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Faturamento Bruto</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.faturamentoBruto)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Faturamento Líquido</div>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData.faturamentoLiquido)}</div>
          </div>
        </div>
      </div>

      {/* Terceira linha - ROAS e ROI */}
      <div className="bg-secondary text-secondary-foreground border-t border-border">
        <div className="grid grid-cols-2 gap-0">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">ROAS</div>
            <div className="text-3xl font-bold">{dashboardData.roas.toFixed(2)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground uppercase">ROI</div>
            <div className="text-3xl font-bold">{dashboardData.roi.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Quarta linha - Métricas finais */}
      <div className="bg-secondary text-secondary-foreground border-t border-border">
        <div className="grid grid-cols-4 gap-0">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Mensagens Recebidas</div>
            <div className="text-3xl font-bold">{formatNumber(dashboardData.mensagensRecebidas)}</div>
          </div>
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Agendados</div>
            <div className="text-3xl font-bold">{formatNumber(dashboardData.pacientesAgendados)}</div>
          </div>
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground uppercase">Efetivados</div>
            <div className="text-3xl font-bold">{formatNumber(dashboardData.pacientesEfetivados)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground uppercase">No-Show</div>
            <div className="text-3xl font-bold">{formatNumber(dashboardData.noShow)}</div>
          </div>
        </div>
      </div>

      {/* Barras de taxa */}
      <div className="grid grid-cols-3 gap-0">
        <div className="bg-primary text-primary-foreground p-6 text-center">
          <div className="text-sm font-semibold mb-2 uppercase">Taxa de Agendamento</div>
          <div className="text-2xl font-bold">{formatPercentage(dashboardData.taxaAgendamento)}</div>
        </div>
        <div className="bg-accent-success text-white p-6 text-center">
          <div className="text-sm font-semibold mb-2 uppercase">Taxa de Comparecimento</div>
          <div className="text-2xl font-bold">{formatPercentage(dashboardData.taxaComparecimento)}</div>
        </div>
        <div className="bg-accent-danger text-white p-6 text-center">
          <div className="text-sm font-semibold mb-2 uppercase">Taxa de No-Show</div>
          <div className="text-2xl font-bold">{formatPercentage(dashboardData.taxaNoShow)}</div>
        </div>
      </div>
    </div>;
};