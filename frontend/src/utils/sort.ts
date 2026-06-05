import type { SortDirection } from '../components/common/SortableTh';

export function nextSortDirection<T extends string>(
  current: { key: T; direction: SortDirection },
  key: T
): SortDirection {
  return current.key === key && current.direction === 'asc' ? 'desc' : 'asc';
}

export function compareText(a?: string | null, b?: string | null): number {
  const first = a?.trim() ?? '';
  const second = b?.trim() ?? '';

  if (!first && second) return 1;
  if (first && !second) return -1;

  return first.localeCompare(second, 'es-AR', { numeric: true, sensitivity: 'base' });
}

export function compareNumber(a?: number | null, b?: number | null): number {
  return (a ?? Number.POSITIVE_INFINITY) - (b ?? Number.POSITIVE_INFINITY);
}

export function compareDate(a?: string | null, b?: string | null): number {
  const first = a ? new Date(a).getTime() : Number.POSITIVE_INFINITY;
  const second = b ? new Date(b).getTime() : Number.POSITIVE_INFINITY;

  return first - second;
}

export function applySortDirection(result: number, direction: SortDirection): number {
  return direction === 'asc' ? result : -result;
}
