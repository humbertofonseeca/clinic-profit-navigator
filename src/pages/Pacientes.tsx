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
import { Plus, User, Search, Mail, Phone, Calendar, MapPin, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  cpf: string | null;
  address: string | null;
  insurance: string | null;
  source: string | null;
  notes: string | null;
  clinic_id: string;
  created_at: string;
}

interface Clinic {
  id: string;
  name: string;
}

export default function Pacientes() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchClinics();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacientes.',
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
    
    const patientData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      birth_date: formData.get('birth_date') as string || null,
      cpf: formData.get('cpf') as string || null,
      address: formData.get('address') as string || null,
      insurance: formData.get('insurance') as string || null,
      source: formData.get('source') as string || null,
      notes: formData.get('notes') as string || null,
      clinic_id: formData.get('clinic_id') as string,
    };

    try {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editingPatient.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([patientData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o paciente.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPatient(null);
    setIsDialogOpen(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Clínica não encontrada';
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de pacientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </DialogTitle>
              <DialogDescription>
                {editingPatient 
                  ? 'Edite as informações do paciente abaixo.'
                  : 'Adicione um novo paciente ao sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingPatient?.name || ''}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_id">Clínica *</Label>
                  <Select name="clinic_id" defaultValue={editingPatient?.clinic_id || ''} required>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingPatient?.email || ''}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editingPatient?.phone || ''}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    defaultValue={editingPatient?.birth_date || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    defaultValue={editingPatient?.cpf || ''}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={editingPatient?.address || ''}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance">Convênio</Label>
                  <Input
                    id="insurance"
                    name="insurance"
                    defaultValue={editingPatient?.insurance || ''}
                    placeholder="Nome do convênio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Origem</Label>
                  <Select name="source" defaultValue={editingPatient?.source || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Como conheceu a clínica?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_ads">Google Ads</SelectItem>
                      <SelectItem value="facebook_ads">Facebook Ads</SelectItem>
                      <SelectItem value="instagram_ads">Instagram Ads</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingPatient?.notes || ''}
                  placeholder="Observações sobre o paciente"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPatient ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-lg">
                    {patient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getClinicName(patient.clinic_id)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(patient)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              
              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {patient.email}
                </div>
              )}
              
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {patient.phone}
                </div>
              )}

              {patient.birth_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                </div>
              )}

              {patient.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{patient.address}</span>
                </div>
              )}

              {patient.source && (
                <Badge variant="secondary" className="text-xs">
                  {patient.source}
                </Badge>
              )}

              {patient.notes && (
                <p className="text-sm text-muted-foreground italic truncate">
                  {patient.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos da busca.'
              : 'Comece adicionando seu primeiro paciente ao sistema.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Paciente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}