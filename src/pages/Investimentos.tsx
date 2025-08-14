import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Search, Calendar, BarChart3, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  source: string;
  investment: number;
  messages_received: number;
  start_date: string;
  end_date: string | null;
  clinic_id: string;
  created_at: string;
}

interface Clinic {
  id: string;
  name: string;
}

export default function Investimentos() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCampaigns();
    fetchClinics();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os investimentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const campaignData = {
      name: formData.get('name') as string,
      source: formData.get('source') as string,
      investment: parseFloat(formData.get('investment') as string),
      messages_received: parseInt(formData.get('messages_received') as string) || 0,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string || null,
      clinic_id: formData.get('clinic_id') as string,
    };

    try {
      const { error } = await supabase
        .from('marketing_campaigns')
        .insert([campaignData]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Campanha criada com sucesso.',
      });

      setIsDialogOpen(false);
      fetchCampaigns();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a campanha.',
        variant: 'destructive',
      });
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'google ads': return 'bg-blue-100 text-blue-800';
      case 'facebook ads': return 'bg-indigo-100 text-indigo-800';
      case 'instagram ads': return 'bg-pink-100 text-pink-800';
      case 'linkedin ads': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Clínica não encontrada';
  };

  const calculateCPL = (investment: number, messages: number) => {
    if (messages === 0) return 0;
    return investment / messages;
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
              <DialogDescription>
                Adicione uma nova campanha de marketing para acompanhar os investimentos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome da campanha"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_id">Clínica *</Label>
                  <Select name="clinic_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Fonte *</Label>
                  <Select name="source" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                      <SelectItem value="Instagram Ads">Instagram Ads</SelectItem>
                      <SelectItem value="LinkedIn Ads">LinkedIn Ads</SelectItem>
                      <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investment">Investimento (R$) *</Label>
                  <Input
                    id="investment"
                    name="investment"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messages_received">Leads Recebidos</Label>
                <Input
                  id="messages_received"
                  name="messages_received"
                  type="number"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Criar Campanha</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Investimento Total</p>
                <p className="text-2xl font-bold">
                  R$ {campaigns.reduce((sum, c) => sum + (c.investment || 0), 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.messages_received || 0), 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPL Médio</p>
                <p className="text-2xl font-bold">
                  R$ {campaigns.length > 0 ? (
                    campaigns.reduce((sum, c) => sum + calculateCPL(c.investment || 0, c.messages_received || 0), 0) / campaigns.length
                  ).toFixed(2) : '0.00'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da campanha ou fonte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Badge className={getSourceColor(campaign.source)}>
                  {campaign.source}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {getClinicName(campaign.clinic_id)}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Investimento</p>
                  <p className="font-semibold text-green-600">
                    R$ {campaign.investment?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Leads</p>
                  <p className="font-semibold">{campaign.messages_received || 0}</p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">CPL (Custo por Lead)</p>
                <p className="font-semibold">
                  R$ {calculateCPL(campaign.investment || 0, campaign.messages_received || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(campaign.start_date).toLocaleDateString('pt-BR')}
                {campaign.end_date && (
                  <>
                    {' até '}
                    {new Date(campaign.end_date).toLocaleDateString('pt-BR')}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha cadastrada'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos da busca.'
              : 'Comece criando sua primeira campanha de marketing.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          )}
        </div>
      )}
    </div>
  );
}