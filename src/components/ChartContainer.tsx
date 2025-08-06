import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const ChartContainer = ({ 
  title, 
  description, 
  children, 
  className = '' 
}: ChartContainerProps) => {
  return (
    <Card className={`shadow-card hover:shadow-elevated transition-all duration-300 ${className}`}>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        <div className="min-h-[300px]">
          {children}
        </div>
      </div>
    </Card>
  );
};