import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Clinic {
  id: string;
  name: string;
  created_at: string;
}

export default function Clinicas() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as clínicas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      if (editingClinic) {
        // Update existing clinic
        const { error } = await supabase
          .from('clinics')
          .update({ name })
          .eq('id', editingClinic.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Clínica atualizada com sucesso.',
        });
      } else {
        // Create new clinic
        const { error } = await supabase
          .from('clinics')
          .insert([{ name }]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Clínica criada com sucesso.',
        });
      }

      setIsDialogOpen(false);
      setEditingClinic(null);
      fetchClinics();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a clínica.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingClinic(null);
    setIsDialogOpen(true);
  };

  if (userRole?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">
          Apenas administradores podem gerenciar clínicas.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Clínicas</h1>
          <p className="text-muted-foreground">Gerencie as clínicas atendidas pela Medsense</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Clínica
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClinic ? 'Editar Clínica' : 'Nova Clínica'}
              </DialogTitle>
              <DialogDescription>
                {editingClinic 
                  ? 'Edite as informações da clínica abaixo.'
                  : 'Adicione uma nova clínica ao sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Clínica</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingClinic?.name || ''}
                  placeholder="Digite o nome da clínica"
                  required
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
                  {editingClinic ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <Card key={clinic.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">
                  Clínica
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(clinic)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{clinic.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Criada em {new Date(clinic.created_at).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {clinics.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma clínica cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando sua primeira clínica ao sistema.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeira Clínica
          </Button>
        </div>
      )}
    </div>
  );
}