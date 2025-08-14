import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X, User } from 'lucide-react';

interface StaffMember {
  user_id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  staff_user_id: string;
  assignment_type: string;
  assigned_at: string;
  is_active: boolean;
  staff_profile?: {
    name: string;
    email: string;
  };
}

interface PatientAssignmentsProps {
  patientId: string;
  patientName: string;
  clinicId: string;
  assignments: Assignment[];
  onAssignmentsUpdate: () => void;
}

export const PatientAssignments = ({ 
  patientId, 
  patientName, 
  clinicId, 
  assignments = [], 
  onAssignmentsUpdate 
}: PatientAssignmentsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignmentType, setAssignmentType] = useState('primary_care');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      fetchAvailableStaff();
    }
  }, [isDialogOpen, clinicId]);

  const fetchAvailableStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          profiles!user_id(name, email)
        `)
        .eq('clinic_id', clinicId)
        .eq('role', 'clinic_staff');

      if (error) throw error;

      const staffList = (data || [])
        .filter(item => item.profiles)
        .map(item => ({
          user_id: item.user_id,
          name: (item.profiles as any)?.name || 'Unknown',
          email: (item.profiles as any)?.email || 'No email'
        }));

      setAvailableStaff(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a equipe.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaff) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patient_staff_assignments')
        .insert({
          patient_id: patientId,
          staff_user_id: selectedStaff,
          clinic_id: clinicId,
          assignment_type: assignmentType,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Profissional atribuído com sucesso.',
      });

      setIsDialogOpen(false);
      setSelectedStaff('');
      onAssignmentsUpdate();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atribuir profissional.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('patient_staff_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Atribuição removida com sucesso.',
      });

      onAssignmentsUpdate();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover atribuição.',
        variant: 'destructive',
      });
    }
  };

  const activeAssignments = assignments.filter(a => a.is_active);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Profissionais Responsáveis</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Atribuir Profissional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atribuir Profissional</DialogTitle>
              <DialogDescription>
                Atribuir um profissional ao paciente {patientName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Profissional</label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff) => (
                      <SelectItem key={staff.user_id} value={staff.user_id}>
                        {staff.name} ({staff.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Atribuição</label>
                <Select value={assignmentType} onValueChange={setAssignmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_care">Cuidado Primário</SelectItem>
                    <SelectItem value="consulting">Consultoria</SelectItem>
                    <SelectItem value="specialist">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAssignStaff} 
                disabled={!selectedStaff || loading}
                className="w-full"
              >
                {loading ? 'Atribuindo...' : 'Atribuir Profissional'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {activeAssignments.length > 0 ? (
          <div className="space-y-3">
            {activeAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {assignment.staff_profile?.name || 'Nome não disponível'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.staff_profile?.email || 'Email não disponível'}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {assignment.assignment_type === 'primary_care' && 'Cuidado Primário'}
                    {assignment.assignment_type === 'consulting' && 'Consultoria'}
                    {assignment.assignment_type === 'specialist' && 'Especialista'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAssignment(assignment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhum profissional atribuído a este paciente.
          </p>
        )}
      </CardContent>
    </Card>
  );
};