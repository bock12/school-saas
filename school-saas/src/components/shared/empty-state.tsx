import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--bg-tertiary))] flex items-center justify-center mb-4">
        {icon || <FileText className="w-6 h-6 text-[hsl(var(--text-tertiary))]" />}
      </div>
      <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] mb-1">{title}</h3>
      <p className="text-sm text-[hsl(var(--text-tertiary))] text-center max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
