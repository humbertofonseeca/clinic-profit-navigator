import { Card } from '@/components/ui/card';

interface ConsolidatedDashboardProps {
  selectedPeriod: string;
  selectedClinic: string;
}

export const ConsolidatedDashboard = ({ selectedPeriod, selectedClinic }: ConsolidatedDashboardProps) => {
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
    const periods: { [key: string]: string } = {
      '7d': '01/08/2025 | Data Final: 08/08/2025',
      '30d': '01/08/2025 | Data Final: 31/08/2025',
      '90d': '01/06/2025 | Data Final: 31/08/2025',
      '1y': '01/08/2024 | Data Final: 31/08/2025'
    };
    return periods[selectedPeriod] || periods['30d'];
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-0">
      {/* Header azul */}
      <div className="bg-primary text-primary-foreground p-6 rounded-t-xl">
        <h1 className="text-2xl font-bold text-center">
          DASHBOARD CONSOLIDADO - LTV E PERFORMANCE DE MARKETING
        </h1>
      </div>

      {/* Subheader cinza escuro */}
      <div className="bg-secondary text-secondary-foreground p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">DASHBOARD DE RESULTADOS CONSOLIDADOS</h2>
          <p className="text-sm opacity-90">Data Inicial: {dashboardData.dataInicial} | Data Final: {dashboardData.dataFinal}</p>
        </div>
      </div>

      {/* Primeira linha de métricas */}
      <div className="bg-secondary text-secondary-foreground border-t border-border">
        <div className="grid grid-cols-6 gap-0">
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Investimento Total</div>
            <div className="text-lg font-bold">{formatCurrency(dashboardData.investimentoTotal)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Valor Utilizado</div>
            <div className="text-lg font-bold">{formatCurrency(dashboardData.valorUtilizado)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Mensagens Recebidas</div>
            <div className="text-lg font-bold">{formatNumber(dashboardData.mensagensRecebidas)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Custo por Mensagem Recebida</div>
            <div className="text-lg font-bold">{formatCurrency(dashboardData.custoPorMensagem)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Custo por Paciente</div>
            <div className="text-lg font-bold">{formatCurrency(dashboardData.custoPorPaciente)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs mb-1 text-muted-foreground">LTV Médio</div>
            <div className="text-lg font-bold">{formatCurrency(dashboardData.ltvMedio)}</div>
          </div>
        </div>
      </div>

      {/* Segunda linha de métricas */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="grid grid-cols-2 gap-0 border-t border-border">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground">Faturamento Bruto</div>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.faturamentoBruto)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground">Faturamento Líquido</div>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.faturamentoLiquido)}</div>
          </div>
        </div>
      </div>

      {/* Terceira linha - ROAS e ROI */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="grid grid-cols-2 gap-0 border-t border-border">
          <div className="p-6 text-center border-r border-border">
            <div className="text-sm mb-2 text-muted-foreground">Retorno sobre Investimento em Publicidade (ROAS)</div>
            <div className="text-3xl font-bold">{dashboardData.roas.toFixed(2)}</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-sm mb-2 text-muted-foreground">Retorno sobre Investimento (ROI)</div>
            <div className="text-3xl font-bold">{dashboardData.roi.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Quarta linha - Métricas finais */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="grid grid-cols-4 gap-0 border-t border-border">
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">Pacientes Adquiridos</div>
            <div className="text-2xl font-bold">{formatNumber(dashboardData.pacientesAdquiridos)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">CAC Médio</div>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.cacMedio)}</div>
          </div>
          <div className="p-4 text-center border-r border-border">
            <div className="text-xs mb-1 text-muted-foreground">LTV Médio</div>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.ltvMedio)}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs mb-1 text-muted-foreground">ROI</div>
            <div className="text-2xl font-bold">{dashboardData.roi.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Barras de taxa */}
      <div className="grid grid-cols-3 gap-0">
        <div className="bg-primary text-primary-foreground p-4 text-center">
          <div className="text-sm font-semibold">Taxa de Agendamento</div>
          <div className="text-xl font-bold">{formatPercentage(dashboardData.taxaAgendamento)}</div>
        </div>
        <div className="bg-accent-success text-white p-4 text-center">
          <div className="text-sm font-semibold">Taxa de Comparecimento</div>
          <div className="text-xl font-bold">{formatPercentage(dashboardData.taxaComparecimento)}</div>
        </div>
        <div className="bg-accent-danger text-white p-4 text-center rounded-br-xl">
          <div className="text-sm font-semibold">Taxa de No-Show</div>
          <div className="text-xl font-bold">{formatPercentage(dashboardData.taxaNoShow)}</div>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="bg-background p-6 space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground">Resumo Executivo Consolidado</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 bg-primary-light border-l-4 border-l-primary">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investimento Total:</h4>
            <p className="text-base text-foreground">
              {formatCurrency(dashboardData.investimentoTotal)} em publicidade
            </p>
          </Card>

          <Card className="p-4 bg-accent-success/10 border-l-4 border-l-accent-success">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Performance:</h4>
            <p className="text-base text-foreground">
              {dashboardData.pacientesEfetivados} pacientes efetivados<br/>
              {formatPercentage(dashboardData.taxaComparecimento)} de comparecimento
            </p>
          </Card>

          <Card className="p-4 bg-warning/10 border-l-4 border-l-warning">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">ROAS Médio:</h4>
            <p className="text-base text-foreground">
              {dashboardData.roas.toFixed(2)} (cada R$ 1 investido gerou R$ {dashboardData.roas.toFixed(2)})
            </p>
          </Card>

          <Card className="p-4 bg-accent-success/10 border-l-4 border-l-accent-success">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Receita Gerada:</h4>
            <p className="text-base text-foreground">
              {formatCurrency(dashboardData.faturamentoBruto)} bruto<br/>
              {formatCurrency(dashboardData.faturamentoLiquido)} líquido
            </p>
          </Card>

          <Card className="p-4 bg-warning/10 border-l-4 border-l-warning">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">LTV por Paciente:</h4>
            <p className="text-base text-foreground">
              {formatCurrency(dashboardData.ltvMedio)} por paciente efetivado
            </p>
          </Card>

          <Card className="p-4 bg-primary-light border-l-4 border-l-primary">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">ROI Médio:</h4>
            <p className="text-base text-foreground">
              {dashboardData.roi.toFixed(2)} ({((dashboardData.roi - 1) * 100).toFixed(0)}% de retorno)
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};