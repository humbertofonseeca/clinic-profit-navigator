import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileBarChart, Download, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/DateRangePicker';

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  totalPatients: number;
  totalAppointments: number;
  totalInvestment: number;
  totalLeads: number;
  profitMargin: number;
  roi: number;
}

export default function Relatorios() {
  const { userRole } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalInvestment: 0,
    totalLeads: 0,
    profitMargin: 0,
    roi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [selectedClinic, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Build date filter
      const startDateStr = startDate?.toISOString().split('T')[0];
      const endDateStr = endDate?.toISOString().split('T')[0];
      
      // Build clinic filter
      let clinicFilter = {};
      if (selectedClinic !== 'all') {
        clinicFilter = { clinic_id: selectedClinic };
      }

      // Fetch appointments data
      let appointmentsQuery = supabase
        .from('appointments')
        .select('amount, status');
      
      if (startDateStr) appointmentsQuery = appointmentsQuery.gte('appointment_date', startDateStr);
      if (endDateStr) appointmentsQuery = appointmentsQuery.lte('appointment_date', endDateStr);
      if (selectedClinic !== 'all') appointmentsQuery = appointmentsQuery.eq('clinic_id', selectedClinic);

      const { data: appointments } = await appointmentsQuery;

      // Fetch expenses data
      let expensesQuery = supabase
        .from('expenses')
        .select('amount');
      
      if (startDateStr) expensesQuery = expensesQuery.gte('date', startDateStr);
      if (endDateStr) expensesQuery = expensesQuery.lte('date', endDateStr);
      if (selectedClinic !== 'all') expensesQuery = expensesQuery.eq('clinic_id', selectedClinic);

      const { data: expenses } = await expensesQuery;

      // Fetch patients data
      let patientsQuery = supabase
        .from('patients')
        .select('id');
      
      if (startDateStr) patientsQuery = patientsQuery.gte('created_at', startDateStr);
      if (endDateStr) patientsQuery = patientsQuery.lte('created_at', endDateStr);
      if (selectedClinic !== 'all') patientsQuery = patientsQuery.eq('clinic_id', selectedClinic);

      const { data: patients } = await patientsQuery;

      // Fetch marketing campaigns data
      let campaignsQuery = supabase
        .from('marketing_campaigns')
        .select('investment, messages_received');
      
      if (startDateStr) campaignsQuery = campaignsQuery.gte('start_date', startDateStr);
      if (endDateStr) campaignsQuery = campaignsQuery.lte('start_date', endDateStr);
      if (selectedClinic !== 'all') campaignsQuery = campaignsQuery.eq('clinic_id', selectedClinic);

      const { data: campaigns } = await campaignsQuery;

      // Calculate metrics
      const totalRevenue = appointments?.reduce((sum, app) => sum + (app.amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const totalPatients = patients?.length || 0;
      const totalAppointments = appointments?.length || 0;
      const totalInvestment = campaigns?.reduce((sum, camp) => sum + (camp.investment || 0), 0) || 0;
      const totalLeads = campaigns?.reduce((sum, camp) => sum + (camp.messages_received || 0), 0) || 0;
      
      const profit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

      setReportData({
        totalRevenue,
        totalExpenses,
        totalPatients,
        totalAppointments,
        totalInvestment,
        totalLeads,
        profitMargin,
        roi,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    // Aqui você pode implementar a geração de relatório em PDF ou Excel
    alert('Funcionalidade de geração de relatório será implementada em breve!');
  };

  if (loading) {
    return <div className="text-center py-12">Carregando relatórios...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do desempenho da clínica</p>
        </div>
        <Button onClick={generateReport}>
          <Download className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="min-w-[200px]">
          <Select value={selectedClinic} onValueChange={setSelectedClinic}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a clínica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Clínicas</SelectItem>
              {/* Aqui você pode adicionar as clínicas dinamicamente */}
            </SelectContent>
          </Select>
        </div>
        
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {reportData.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {reportData.totalExpenses.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Pacientes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData.totalPatients}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultas Realizadas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportData.totalAppointments}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Análise Financeira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Receita Total</span>
              <span className="text-green-600 font-semibold">
                R$ {reportData.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Despesas Totais</span>
              <span className="text-red-600 font-semibold">
                R$ {reportData.totalExpenses.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium">Lucro Líquido</span>
              <span className={`font-semibold ${
                reportData.totalRevenue - reportData.totalExpenses >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                R$ {(reportData.totalRevenue - reportData.totalExpenses).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Margem de Lucro</span>
              <span className={`font-semibold ${
                reportData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {reportData.profitMargin.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing & ROI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Investimento Total</span>
              <span className="text-blue-600 font-semibold">
                R$ {reportData.totalInvestment.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Leads Gerados</span>
              <span className="font-semibold">{reportData.totalLeads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Custo por Lead</span>
              <span className="font-semibold">
                R$ {reportData.totalLeads > 0 
                  ? (reportData.totalInvestment / reportData.totalLeads).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm font-medium">ROI</span>
              <span className={`font-semibold ${
                reportData.roi >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {reportData.roi.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <FileBarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Gráfico de receita em desenvolvimento</p>
                <p className="text-sm">Integração com Recharts será implementada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <FileBarChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Gráfico de despesas em desenvolvimento</p>
                <p className="text-sm">Gráfico de pizza com categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}