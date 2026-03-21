import { cn } from '@/lib/utils'
import { TrafficLight } from '@/types'

interface TrafficLightBadgeProps {
  status: TrafficLight
  label?: string
  size?: 'sm' | 'md'
}

const config = {
  verde: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Verde' },
  amarelo: { dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Amarelo' },
  vermelho: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Vermelho' },
  cinza: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', label: 'N/A' },
}

export function TrafficLightBadge({ status, label, size = 'md' }: TrafficLightBadgeProps) {
  const c = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        c.bg,
        c.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', c.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {label || c.label}
    </span>
  )
}

export function TrafficLightDot({ status, className }: { status: TrafficLight; className?: string }) {
  const c = config[status]
  return (
    <span className={cn('inline-block rounded-full w-3 h-3 flex-shrink-0', c.dot, className)} />
  )
}
