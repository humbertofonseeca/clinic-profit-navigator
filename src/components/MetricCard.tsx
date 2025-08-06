import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  currency?: boolean;
}

export const MetricCard = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  description,
  variant = 'default',
  currency = false
}: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    if (currency && typeof val === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val);
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-accent-success';
      case 'down':
        return 'text-accent-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-4 border-l-accent-success bg-gradient-to-r from-accent-success/5 to-transparent';
      case 'warning':
        return 'border-l-4 border-l-accent-warning bg-gradient-to-r from-accent-warning/5 to-transparent';
      case 'danger':
        return 'border-l-4 border-l-accent-danger bg-gradient-to-r from-accent-danger/5 to-transparent';
      default:
        return 'border-l-4 border-l-primary bg-gradient-metric';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-elevated",
      "shadow-card",
      getVariantStyles()
    )}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-foreground">
                  {formatValue(value)}
                </p>
                {change && (
                  <span className={cn(
                    "text-sm font-medium flex items-center",
                    getTrendColor()
                  )}>
                    {trend === 'up' && (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend === 'down' && (
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {change}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-3 border-t pt-3">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};