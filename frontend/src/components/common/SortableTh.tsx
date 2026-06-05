import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

interface SortableThProps<T extends string> {
  label: string;
  sortKey: T;
  activeKey: T;
  direction: SortDirection;
  onSort: (key: T) => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export default function SortableTh<T extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
  className = 'px-6 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400',
}: SortableThProps<T>) {
  const isActive = activeKey === sortKey;
  const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ChevronUp : ChevronDown;
  const justify = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th className={`${textAlign} ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full items-center gap-1.5 ${justify} transition-colors hover:text-gray-600 ${isActive ? 'text-gray-700' : ''}`}
        aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      </button>
    </th>
  );
}
