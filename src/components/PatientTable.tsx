import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Patient {
  id: string;
  name: string;
  acquisitionDate: string;
  source: string;
  ltv: number;
  status: 'active' | 'inactive';
  lastVisit: string;
}

interface PatientTableProps {
  patients: Patient[];
}

export const PatientTable = ({ patients }: PatientTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'Google Ads':
        return 'default';
      case 'Facebook Ads':
        return 'secondary';
      case 'Instagram Ads':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Pacientes Recentes
            </h3>
            <p className="text-sm text-muted-foreground">
              Últimos pacientes adquiridos via campanhas
            </p>
          </div>
          
          <Badge variant="outline" className="px-3 py-1">
            {patients.length} pacientes
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Paciente
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Fonte
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  LTV
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Última Consulta
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {patient.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Captado em {formatDate(patient.acquisitionDate)}
                      </p>
                    </div>
                  </td>
                  
                  <td className="py-4 px-4">
                    <Badge variant={getSourceBadgeVariant(patient.source)}>
                      {patient.source}
                    </Badge>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(patient.ltv)}
                    </span>
                  </td>
                  
                  <td className="py-4 px-4">
                    <Badge 
                      variant={patient.status === 'active' ? 'default' : 'secondary'}
                      className={patient.status === 'active' ? 'bg-accent-success text-white' : ''}
                    >
                      {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(patient.lastVisit)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};