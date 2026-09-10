import { cn } from '@/lib/utils';
import { projectStatusLabels } from './status';
import type { ProjectStatus } from '@/types/api';

// DESIGN.md → Badges: soft semantic tint (10% background), full-strength text, 6px dot.
const statusStyles: Record<ProjectStatus, string> = {
  draft: 'bg-muted text-muted-foreground [&>span]:bg-muted-foreground',
  active: 'bg-success/10 text-success [&>span]:bg-success',
  done: 'bg-info/10 text-info [&>span]:bg-info',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        statusStyles[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" />
      {projectStatusLabels[status]}
    </span>
  );
}
