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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Receipt, Search, Calendar, DollarSign, Building, Edit, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string | null;
  supplier: string | null;
  payment_method: string | null;
  invoice_number: string | null;
  is_recurring: boolean;
  clinic_id: string;
  created_at: string;
}

interface Clinic {
  id: string;
  name: string;
}

export default function Despesas() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchClinics();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as despesas.',
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
    
    const expenseData = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      category: formData.get('category') as string || null,
      supplier: formData.get('supplier') as string || null,
      payment_method: formData.get('payment_method') as string || null,
      invoice_number: formData.get('invoice_number') as string || null,
      is_recurring: formData.get('is_recurring') === 'on',
      clinic_id: formData.get('clinic_id') as string,
    };

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Despesa atualizada com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Despesa cadastrada com sucesso.',
        });
      }

      setIsDialogOpen(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a despesa.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category.toLowerCase()) {
      case 'marketing': return 'bg-blue-100 text-blue-800';
      case 'equipamentos': return 'bg-green-100 text-green-800';
      case 'aluguel': return 'bg-orange-100 text-orange-800';
      case 'materiais': return 'bg-purple-100 text-purple-800';
      case 'pessoal': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string | null) => {
    if (!method) return 'bg-gray-100 text-gray-800';
    
    switch (method.toLowerCase()) {
      case 'dinheiro': return 'bg-green-100 text-green-800';
      case 'cartão': return 'bg-blue-100 text-blue-800';
      case 'pix': return 'bg-purple-100 text-purple-800';
      case 'transferência': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Clínica não encontrada';
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Gerencie as despesas da clínica</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </DialogTitle>
              <DialogDescription>
                {editingExpense 
                  ? 'Edite as informações da despesa abaixo.'
                  : 'Adicione uma nova despesa ao sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingExpense?.description || ''}
                    placeholder="Descrição da despesa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_id">Clínica *</Label>
                  <Select name="clinic_id" defaultValue={editingExpense?.clinic_id || ''} required>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingExpense?.amount || ''}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingExpense?.date || ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" defaultValue={editingExpense?.category || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Materiais">Materiais</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Input
                    id="supplier"
                    name="supplier"
                    defaultValue={editingExpense?.supplier || ''}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Forma de Pagamento</Label>
                  <Select name="payment_method" defaultValue={editingExpense?.payment_method || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_number">Número da Nota Fiscal</Label>
                <Input
                  id="invoice_number"
                  name="invoice_number"
                  defaultValue={editingExpense?.invoice_number || ''}
                  placeholder="Número da NF"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_recurring" 
                  name="is_recurring"
                  defaultChecked={editingExpense?.is_recurring || false}
                />
                <Label htmlFor="is_recurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Despesa recorrente
                </Label>
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
                  {editingExpense ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição, fornecedor ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                {expense.is_recurring && (
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(expense)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <CardTitle className="text-lg">{expense.description}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {getClinicName(expense.clinic_id)}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
                <DollarSign className="h-5 w-5" />
                R$ {expense.amount.toFixed(2)}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(expense.date).toLocaleDateString('pt-BR')}
              </div>

              <div className="flex flex-wrap gap-2">
                {expense.category && (
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                )}
                
                {expense.payment_method && (
                  <Badge className={getPaymentMethodColor(expense.payment_method)}>
                    {expense.payment_method}
                  </Badge>
                )}
              </div>

              {expense.supplier && (
                <p className="text-sm text-muted-foreground">
                  <strong>Fornecedor:</strong> {expense.supplier}
                </p>
              )}

              {expense.invoice_number && (
                <p className="text-sm text-muted-foreground">
                  <strong>NF:</strong> {expense.invoice_number}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa cadastrada'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos da busca.'
              : 'Comece cadastrando sua primeira despesa.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeira Despesa
            </Button>
          )}
        </div>
      )}
    </div>
  );
}