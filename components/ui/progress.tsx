import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // 0-100
  className?: string
  color?: 'violet' | 'emerald' | 'amber' | 'red'
}

const colors = {
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
}

function getColor(value: number): keyof typeof colors {
  if (value >= 80) return 'emerald'
  if (value >= 50) return 'amber'
  if (value > 0) return 'red'
  return 'violet'
}

export function Progress({ value, className, color }: ProgressProps) {
  const c = color || getColor(value)
  return (
    <div className={cn('h-2 w-full rounded-full bg-gray-100', className)}>
      <div
        className={cn('h-full rounded-full transition-all', colors[c])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
