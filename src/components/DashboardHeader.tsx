import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/DateRangePicker';

interface DashboardHeaderProps {
  selectedClinic: string;
  onClinicChange: (clinic: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export const DashboardHeader = ({
  selectedClinic,
  onClinicChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DashboardHeaderProps) => {
  return (
    <div className="bg-card shadow-card rounded-xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard LTV Analytics
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o Lifetime Value e ROI das suas campanhas de marketing médico
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClinic} onValueChange={onClinicChange}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Selecionar clínica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as clínicas</SelectItem>
              <SelectItem value="clinica-abc">Clínica ABC</SelectItem>
              <SelectItem value="clinica-xyz">Clínica XYZ</SelectItem>
              <SelectItem value="centro-medico">Centro Médico Premium</SelectItem>
            </SelectContent>
          </Select>
          
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
          
          <Button variant="outline" className="whitespace-nowrap">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};