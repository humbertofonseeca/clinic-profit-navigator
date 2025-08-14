import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Stethoscope, Search, DollarSign, Clock, Edit } from 'lucide-react';

interface Procedure {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  cost: number | null;
  duration: number | null;
  category: string | null;
  code: string | null;
  created_at: string;
}

export default function Procedimentos() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os procedimentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const procedureData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      price: parseFloat(formData.get('price') as string) || null,
      cost: parseFloat(formData.get('cost') as string) || null,
      duration: parseInt(formData.get('duration') as string) || null,
      category: formData.get('category') as string || null,
      code: formData.get('code') as string || null,
    };

    try {
      if (editingProcedure) {
        const { error } = await supabase
          .from('procedures')
          .update(procedureData)
          .eq('id', editingProcedure.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Procedimento atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('procedures')
          .insert([procedureData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Procedimento criado com sucesso.',
        });
      }

      setIsDialogOpen(false);
      setEditingProcedure(null);
      fetchProcedures();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o procedimento.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProcedure(null);
    setIsDialogOpen(true);
  };

  const filteredProcedures = procedures.filter(procedure =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Procedimentos</h1>
          <p className="text-muted-foreground">Gerencie os procedimentos disponíveis</p>
        </div>
        {userRole?.role === 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Procedimento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
                </DialogTitle>
                <DialogDescription>
                  {editingProcedure 
                    ? 'Edite as informações do procedimento abaixo.'
                    : 'Adicione um novo procedimento ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingProcedure?.name || ''}
                      placeholder="Nome do procedimento"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input
                      id="code"
                      name="code"
                      defaultValue={editingProcedure?.code || ''}
                      placeholder="Código do procedimento"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProcedure?.description || ''}
                    placeholder="Descrição do procedimento"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProcedure?.price || ''}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Custo (R$)</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      step="0.01"
                      defaultValue={editingProcedure?.cost || ''}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      defaultValue={editingProcedure?.duration || ''}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingProcedure?.category || ''}
                    placeholder="Categoria do procedimento"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProcedure ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, categoria ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Procedures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcedures.map((procedure) => (
          <Card key={procedure.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                {procedure.code && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {procedure.code}
                  </span>
                )}
              </div>
              {userRole?.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(procedure)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <CardTitle className="text-lg">{procedure.name}</CardTitle>
                {procedure.category && (
                  <p className="text-sm text-muted-foreground">{procedure.category}</p>
                )}
              </div>
              
              {procedure.description && (
                <p className="text-sm text-muted-foreground">
                  {procedure.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {procedure.price && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      R$ {procedure.price.toFixed(2)}
                    </span>
                  </div>
                )}
                
                {procedure.duration && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{procedure.duration} min</span>
                  </div>
                )}
              </div>

              {procedure.cost && (
                <div className="text-sm text-muted-foreground">
                  Custo: R$ {procedure.cost.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProcedures.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'Nenhum procedimento encontrado' : 'Nenhum procedimento cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos da busca.'
              : 'Comece adicionando seu primeiro procedimento ao sistema.'
            }
          </p>
          {!searchTerm && userRole?.role === 'admin' && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Procedimento
            </Button>
          )}
        </div>
      )}
    </div>
  );
}