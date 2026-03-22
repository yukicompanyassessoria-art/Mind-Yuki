'use client'

import { useState, useEffect, useCallback } from 'react'
import { RITUALS } from '@/lib/mock-data'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChecklistCategory } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  CheckSquare,
  Square,
  CalendarDays,
  Trash2,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

type EventCategory = ChecklistCategory | 'ritual_time' | 'ritual_dept'

interface AgendaEvent {
  id: string
  title: string
  time?: string
  category: EventCategory
  dayIndex: number // 0=Mon … 6=Sun
  source: 'ritual' | 'manual'
  ritualId?: string
}

// ─── Category config ───────────────────────────────────────────────────────────

const CAT_CONFIG: Record<
  EventCategory,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  ritual_time: {
    label: 'Ritual · Time',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    border: 'border-blue-200',
  },
  ritual_dept: {
    label: 'Ritual · Área',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-400',
    border: 'border-indigo-200',
  },
  reuniao_clientes: {
    label: 'Clientes',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    border: 'border-violet-200',
  },
  reuniao_time: {
    label: 'Time',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  reuniao_novos_clientes: {
    label: 'Novos Clientes',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
  reuniao_parceiros: {
    label: 'Parceiros',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  reuniao_socio: {
    label: 'Sócio',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
  operacional: {
    label: 'Operacional',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
    border: 'border-cyan-200',
  },
  marketing: {
    label: 'Marketing',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
  },
  estrategia: {
    label: 'Estratégia',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  financeiro: {
    label: 'Financeiro',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    border: 'border-teal-200',
  },
  outros: {
    label: 'Outros',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    border: 'border-gray-200',
  },
}

const MANUAL_CATEGORIES: { key: ChecklistCategory; label: string }[] = [
  { key: 'reuniao_clientes', label: 'Reunião com Cliente' },
  { key: 'reuniao_time', label: 'Reunião com Time' },
  { key: 'reuniao_novos_clientes', label: 'Novo Cliente / Prospecção' },
  { key: 'reuniao_parceiros', label: 'Parceiro Externo' },
  { key: 'reuniao_socio', label: 'Reunião com Sócio' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'estrategia', label: 'Estratégia' },
  { key: 'operacional', label: 'Operacional' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'outros', label: 'Outros' },
]

const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const DAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

// ─── Date helpers ──────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function weekKey(monday: Date): string {
  return `${monday.getFullYear()}-W${String(getISOWeek(monday)).padStart(2, '0')}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function isToday(date: Date): boolean {
  const t = new Date()
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  )
}

function isPast(date: Date): boolean {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return date < t
}

// ─── Ritual → AgendaEvent mapper ───────────────────────────────────────────────

function ritualsToEvents(monday: Date): AgendaEvent[] {
  const events: AgendaEvent[] = []
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  RITUALS.filter(r => r.is_active && r.frequency === 'semanal' && r.day_of_week !== undefined).forEach(r => {
    // day_of_week: 0=Sun, 1=Mon, … 6=Sat  →  dayIndex: 0=Mon, …, 6=Sun
    const dow = r.day_of_week! // e.g. 1 for Monday
    const dayIndex = dow === 0 ? 6 : dow - 1
    if (dayIndex >= 0 && dayIndex <= 6) {
      const cat: EventCategory = r.department_id ? 'ritual_dept' : 'ritual_time'
      events.push({
        id: `ritual-${r.id}`,
        title: r.name,
        time: r.time,
        category: cat,
        dayIndex,
        source: 'ritual',
        ritualId: r.id,
      })
    }
  })

  // Daily rituals: show Mon-Fri
  RITUALS.filter(r => r.is_active && r.frequency === 'diario').forEach(r => {
    for (let i = 0; i <= 4; i++) {
      events.push({
        id: `ritual-${r.id}-${i}`,
        title: r.name,
        time: r.time,
        category: 'ritual_time',
        dayIndex: i,
        source: 'ritual',
        ritualId: r.id,
      })
    }
  })

  return events.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
}

// ─── Storage ───────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'yuki-agenda'

function loadManualEvents(wk: string): AgendaEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-events-${wk}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveManualEvents(wk: string, events: AgendaEvent[]) {
  localStorage.setItem(`${STORAGE_PREFIX}-events-${wk}`, JSON.stringify(events))
}

function loadDone(wk: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-done-${wk}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveDone(wk: string, done: Record<string, boolean>) {
  localStorage.setItem(`${STORAGE_PREFIX}-done-${wk}`, JSON.stringify(done))
}

// ─── Add Event Modal ───────────────────────────────────────────────────────────

interface AddEventModalProps {
  weekDays: Date[]
  defaultDayIndex: number
  onAdd: (event: Omit<AgendaEvent, 'id' | 'source'>) => void
  onClose: () => void
}

function AddEventModal({ weekDays, defaultDayIndex, onAdd, onClose }: AddEventModalProps) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [dayIndex, setDayIndex] = useState(defaultDayIndex)
  const [category, setCategory] = useState<ChecklistCategory>('reuniao_clientes')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), time: time || undefined, dayIndex, category })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Adicionar Evento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Evento / Reunião *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Reunião com Clínica Estétic Pro"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Dia</label>
              <select
                value={dayIndex}
                onChange={e => setDayIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {weekDays.map((d, i) => (
                  <option key={i} value={i}>
                    {DAY_NAMES[i]} {formatDate(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Horário (opcional)</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ChecklistCategory)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {MANUAL_CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>Adicionar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Event Card ────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: AgendaEvent
  done: boolean
  onToggle: () => void
  onDelete?: () => void
}

function EventCard({ event, done, onToggle, onDelete }: EventCardProps) {
  const cfg = CAT_CONFIG[event.category]
  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-2 rounded-lg border group transition-all',
        done
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : `${cfg.bg} ${cfg.border}`
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex-shrink-0 transition-colors',
          done ? 'text-green-500' : `${cfg.text}`
        )}
      >
        {done ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium leading-tight', done ? 'line-through text-gray-400' : cfg.text)}>
          {event.title}
        </p>
        {event.time && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <Clock className={cn('w-2.5 h-2.5', cfg.text, 'opacity-60')} />
            <span className={cn('text-xs opacity-70', cfg.text)}>{event.time}</span>
          </div>
        )}
      </div>
      {onDelete && event.source === 'manual' && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// ─── Day Column ────────────────────────────────────────────────────────────────

interface DayColumnProps {
  date: Date
  dayIndex: number
  events: AgendaEvent[]
  done: Record<string, boolean>
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

function DayColumn({ date, dayIndex, events, done, onToggle, onDelete, onAdd }: DayColumnProps) {
  const today = isToday(date)
  const past = isPast(date) && !today
  const sortedEvents = [...events].sort((a, b) =>
    (a.time ?? '99:99').localeCompare(b.time ?? '99:99')
  )
  const doneCount = sortedEvents.filter(e => done[e.id]).length

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border min-h-[200px] transition-all',
        today
          ? 'border-violet-300 shadow-md shadow-violet-100'
          : past
          ? 'border-gray-100 bg-gray-50/50'
          : 'border-gray-200 bg-white'
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          'px-3 py-2.5 rounded-t-xl border-b',
          today
            ? 'bg-violet-600 border-violet-600'
            : past
            ? 'bg-gray-100 border-gray-200'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={cn('text-xs font-bold uppercase tracking-wider', today ? 'text-white' : past ? 'text-gray-400' : 'text-gray-600')}>
              {DAY_SHORT[dayIndex]}
            </p>
            <p className={cn('text-lg font-bold leading-tight', today ? 'text-white' : past ? 'text-gray-400' : 'text-gray-900')}>
              {date.getDate()}
            </p>
            <p className={cn('text-xs', today ? 'text-violet-200' : 'text-gray-400')}>
              {date.toLocaleDateString('pt-BR', { month: 'short' })}
            </p>
          </div>
          {sortedEvents.length > 0 && (
            <div className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full', today ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600')}>
              {doneCount}/{sortedEvents.length}
            </div>
          )}
        </div>
        {today && (
          <Badge className="mt-1 bg-white/20 text-white border-transparent text-xs">
            Hoje
          </Badge>
        )}
      </div>

      {/* Events */}
      <div className="flex-1 p-2 space-y-1.5">
        {sortedEvents.length === 0 && (
          <p className="text-xs text-gray-300 text-center py-4">Livre</p>
        )}
        {sortedEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            done={!!done[event.id]}
            onToggle={() => onToggle(event.id)}
            onDelete={event.source === 'manual' ? () => onDelete(event.id) : undefined}
          />
        ))}
      </div>

      {/* Add button */}
      <div className="p-2 pt-0">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors border border-dashed border-gray-200 hover:border-violet-300"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>
    </div>
  )
}

// ─── Weekly Summary ────────────────────────────────────────────────────────────

function WeeklySummary({ events }: { events: AgendaEvent[] }) {
  const counts: Partial<Record<EventCategory, number>> = {}
  events.forEach(e => {
    counts[e.category] = (counts[e.category] ?? 0) + 1
  })

  const topCategories = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const focusScore = Math.min(100, Math.round((events.length / 20) * 100))
  const densityLabel =
    events.length <= 5 ? 'Semana leve' :
    events.length <= 12 ? 'Semana equilibrada' :
    events.length <= 20 ? 'Semana intensa' :
    'Semana sobrecarregada'

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Densidade da semana</p>
              <p className="text-sm font-bold text-gray-900">{densityLabel}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-bold text-gray-900">{events.length}</span>
            <span>eventos · </span>
            {topCategories.map(([cat, count]) => {
              const cfg = CAT_CONFIG[cat as EventCategory]
              return (
                <span key={cat} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border', cfg.bg, cfg.text, cfg.border)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                  {count} {cfg.label}
                </span>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()))
  const [manualEvents, setManualEvents] = useState<AgendaEvent[]>([])
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [addModal, setAddModal] = useState<{ dayIndex: number } | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const wk = weekKey(monday)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const ritualEvents = ritualsToEvents(monday)
  const allEvents = [...ritualEvents, ...manualEvents]

  // Hydrate
  useEffect(() => {
    setMonday(getMonday(new Date()))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    setManualEvents(loadManualEvents(wk))
    setDone(loadDone(wk))
  }, [wk, hydrated])

  const handleToggle = useCallback(
    (eventId: string) => {
      setDone(prev => {
        const next = { ...prev, [eventId]: !prev[eventId] }
        saveDone(wk, next)
        return next
      })
    },
    [wk]
  )

  const handleDelete = useCallback(
    (eventId: string) => {
      setManualEvents(prev => {
        const next = prev.filter(e => e.id !== eventId)
        saveManualEvents(wk, next)
        return next
      })
    },
    [wk]
  )

  const handleAdd = useCallback(
    (partial: Omit<AgendaEvent, 'id' | 'source'>) => {
      const event: AgendaEvent = {
        ...partial,
        id: `manual-${Date.now()}`,
        source: 'manual',
      }
      setManualEvents(prev => {
        const next = [...prev, event]
        saveManualEvents(wk, next)
        return next
      })
    },
    [wk]
  )

  const prevWeek = () => setMonday(prev => addDays(prev, -7))
  const nextWeek = () => setMonday(prev => addDays(prev, 7))
  const goToday = () => setMonday(getMonday(new Date()))

  const isCurrentWeek = weekKey(monday) === weekKey(new Date())

  if (!hydrated) return null

  return (
    <div>
      <Header
        title="Minha Semana"
        subtitle="Planejamento e visão diária da sua agenda"
        action={
          <Button size="sm" onClick={() => setAddModal({ dayIndex: Math.max(0, (new Date().getDay() + 6) % 7) })}>
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        }
      />

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-gray-900">
            {formatDate(monday)} – {formatDate(weekDays[6])} · {wk}
          </span>
          {isCurrentWeek && (
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">Semana Atual</Badge>
          )}
        </div>

        <button
          onClick={nextWeek}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isCurrentWeek && (
          <button
            onClick={goToday}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium ml-1"
          >
            Ir para hoje
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={nextWeek}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-600 font-medium transition-colors"
          >
            Ver próxima semana <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Weekly summary */}
      <WeeklySummary events={allEvents.filter(e => !done[e.id])} />

      {/* Day grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((date, i) => {
          const dayEvents = allEvents.filter(e => e.dayIndex === i)
          return (
            <DayColumn
              key={i}
              date={date}
              dayIndex={i}
              events={dayEvents}
              done={done}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onAdd={() => setAddModal({ dayIndex: i })}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 mr-1">Legenda:</span>
        {(['ritual_time', 'ritual_dept', 'reuniao_clientes', 'reuniao_socio', 'reuniao_novos_clientes', 'reuniao_parceiros', 'marketing', 'estrategia', 'financeiro'] as EventCategory[]).map(cat => {
          const cfg = CAT_CONFIG[cat]
          return (
            <span
              key={cat}
              className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border', cfg.bg, cfg.text, cfg.border)}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
              {cfg.label}
            </span>
          )
        })}
      </div>

      {/* Add event modal */}
      {addModal && (
        <AddEventModal
          weekDays={weekDays}
          defaultDayIndex={addModal.dayIndex}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
        />
      )}
    </div>
  )
}
