import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        'bg-surface rounded-md shadow-card',
        paddingStyles[padding],
        hoverable && 'hover:shadow-elevated transition-shadow cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'accent' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
}) => {
  const colorStyles = {
    primary: 'bg-gradient-to-br from-primary to-secondary text-white',
    accent: 'bg-gradient-to-br from-accent to-green-400 text-white',
    danger: 'bg-gradient-to-br from-danger to-red-400 text-white',
  };

  return (
    <Card className={clsx('rounded-lg', colorStyles[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <span className={trend.isPositive ? 'text-green-200' : 'text-red-200'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-3xl opacity-80">{icon}</div>}
      </div>
    </Card>
  );
};
