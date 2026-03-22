'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChecklistItem, ChecklistFrequency, ChecklistCategory } from '@/types'
import { DEFAULT_CHECKLIST_ITEMS } from '@/lib/checklist-defaults'
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREQUENCY_CONFIG: Record<
  ChecklistFrequency,
  { label: string; color: string; badge: string; description: string }
> = {
  semanal: {
    label: 'Semanal',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Ações que se repetem toda semana',
  },
  mensal: {
    label: 'Mensal',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    description: 'Ações que se repetem todo mês',
  },
  trimestral: {
    label: 'Trimestral',
    color: 'text-violet-700 bg-violet-50 border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    description: 'Ações que se repetem a cada trimestre',
  },
  anual: {
    label: 'Anual',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    description: 'Ações que se repetem todo ano',
  },
}

const CATEGORY_CONFIG: Record<
  ChecklistCategory,
  { label: string; color: string; dotColor: string }
> = {
  reuniao_clientes: {
    label: 'Reunião com Clientes',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    dotColor: 'bg-violet-500',
  },
  reuniao_time: {
    label: 'Reunião com Time',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  reuniao_novos_clientes: {
    label: 'Novos Clientes',
    color: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  reuniao_parceiros: {
    label: 'Parceiros Externos',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  reuniao_socio: {
    label: 'Reunião com Sócio',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
  operacional: {
    label: 'Operacional',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  marketing: {
    label: 'Marketing',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500',
  },
  estrategia: {
    label: 'Estratégia',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  financeiro: {
    label: 'Financeiro',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    dotColor: 'bg-teal-500',
  },
  outros: {
    label: 'Outros',
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    dotColor: 'bg-gray-400',
  },
}

const CATEGORY_ORDER: ChecklistCategory[] = [
  'reuniao_socio',
  'reuniao_clientes',
  'reuniao_time',
  'reuniao_novos_clientes',
  'reuniao_parceiros',
  'estrategia',
  'marketing',
  'operacional',
  'financeiro',
  'outros',
]

// ─── Period key helpers ────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getPeriodKey(freq: ChecklistFrequency, date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const w = String(getISOWeek(date)).padStart(2, '0')

  switch (freq) {
    case 'semanal':
      return `${y}-W${w}`
    case 'mensal':
      return `${y}-${m}`
    case 'trimestral':
      return `${y}-Q${q}`
    case 'anual':
      return `${y}`
  }
}

function getPeriodLabel(freq: ChecklistFrequency, date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = date.toLocaleString('pt-BR', { month: 'long' })
  const q = Math.ceil((date.getMonth() + 1) / 3)
  const w = getISOWeek(date)

  switch (freq) {
    case 'semanal':
      return `Semana ${w} de ${y}`
    case 'mensal':
      return `${m.charAt(0).toUpperCase() + m.slice(1)} de ${y}`
    case 'trimestral':
      return `Q${q} de ${y}`
    case 'anual':
      return `Ano ${y}`
  }
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

const STORAGE_ITEMS_KEY = 'yuki-checklist-items'
const STORAGE_DONE_KEY = 'yuki-checklist-done'

function loadItems(): ChecklistItem[] {
  if (typeof window === 'undefined') return DEFAULT_CHECKLIST_ITEMS
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY)
    return raw ? (JSON.parse(raw) as ChecklistItem[]) : DEFAULT_CHECKLIST_ITEMS
  } catch {
    return DEFAULT_CHECKLIST_ITEMS
  }
}

function saveItems(items: ChecklistItem[]) {
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items))
}

function loadDone(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_DONE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDone(done: Record<string, boolean>) {
  localStorage.setItem(STORAGE_DONE_KEY, JSON.stringify(done))
}

function doneKey(itemId: string, periodKey: string) {
  return `${itemId}::${periodKey}`
}

// ─── Add Item Modal ────────────────────────────────────────────────────────────

interface AddItemModalProps {
  defaultFrequency: ChecklistFrequency
  onAdd: (item: Omit<ChecklistItem, 'id' | 'created_at' | 'order'>) => void
  onClose: () => void
}

function AddItemModal({ defaultFrequency, onAdd, onClose }: AddItemModalProps) {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<ChecklistFrequency>(defaultFrequency)
  const [category, setCategory] = useState<ChecklistCategory>('outros')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), frequency, category })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Nova Ação no Checklist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Descrição da ação *
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Reunião de alinhamento com cliente X"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Frequência</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as ChecklistFrequency)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {Object.entries(FREQUENCY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ChecklistCategory)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {CATEGORY_ORDER.map(k => (
                  <option key={k} value={k}>
                    {CATEGORY_CONFIG[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Checklist Item Row ────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ChecklistItem
  done: boolean
  onToggle: () => void
  onDelete: () => void
}

function ItemRow({ item, done, onToggle, onDelete }: ItemRowProps) {
  const cat = CATEGORY_CONFIG[item.category]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all group',
        done
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'flex-shrink-0 transition-colors',
          done ? 'text-green-500' : 'text-gray-300 hover:text-violet-500'
        )}
      >
        {done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm transition-colors',
            done ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'
          )}
        >
          {item.title}
        </span>
      </div>

      <span
        className={cn(
          'hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
          cat.color
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cat.dotColor)} />
        {cat.label}
      </span>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0 p-1 rounded"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Category Group ────────────────────────────────────────────────────────────

interface CategoryGroupProps {
  category: ChecklistCategory
  items: ChecklistItem[]
  done: Record<string, boolean>
  periodKey: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function CategoryGroup({
  category,
  items,
  done,
  periodKey,
  onToggle,
  onDelete,
}: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const cat = CATEGORY_CONFIG[category]
  const completedCount = items.filter(i => done[doneKey(i.id, periodKey)]).length

  return (
    <div>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 w-full mb-2 group"
      >
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.dotColor)} />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {cat.label}
        </span>
        <span className="text-xs text-gray-400">
          {completedCount}/{items.length}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
        )}
      </button>

      {!collapsed && (
        <div className="space-y-2 mb-5">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              done={!!done[doneKey(item.id, periodKey)]}
              onToggle={() => onToggle(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const FREQUENCY_TABS: ChecklistFrequency[] = ['semanal', 'mensal', 'trimestral', 'anual']

export default function ChecklistPage() {
  const [activeFreq, setActiveFreq] = useState<ChecklistFrequency>('semanal')
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    setItems(loadItems())
    setDone(loadDone())
    setHydrated(true)
  }, [])

  const periodKey = getPeriodKey(activeFreq)
  const periodLabel = getPeriodLabel(activeFreq)

  const freqItems = items.filter(i => i.frequency === activeFreq)
  const completedCount = freqItems.filter(i => done[doneKey(i.id, periodKey)]).length
  const progress = freqItems.length > 0 ? Math.round((completedCount / freqItems.length) * 100) : 0

  // Group items by category preserving CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.reduce<Record<ChecklistCategory, ChecklistItem[]>>(
    (acc, cat) => {
      acc[cat] = freqItems.filter(i => i.category === cat)
      return acc
    },
    {} as Record<ChecklistCategory, ChecklistItem[]>
  )

  const handleToggle = useCallback(
    (itemId: string) => {
      const key = doneKey(itemId, periodKey)
      setDone(prev => {
        const next = { ...prev, [key]: !prev[key] }
        saveDone(next)
        return next
      })
    },
    [periodKey]
  )

  const handleDelete = useCallback(
    (itemId: string) => {
      setItems(prev => {
        const next = prev.filter(i => i.id !== itemId)
        saveItems(next)
        return next
      })
    },
    []
  )

  const handleAdd = useCallback(
    (newItem: Omit<ChecklistItem, 'id' | 'created_at' | 'order'>) => {
      const item: ChecklistItem = {
        ...newItem,
        id: `ck-${Date.now()}`,
        order: items.filter(i => i.frequency === newItem.frequency).length + 1,
        created_at: new Date().toISOString().split('T')[0],
      }
      setItems(prev => {
        const next = [...prev, item]
        saveItems(next)
        return next
      })
    },
    [items]
  )

  const handleResetPeriod = useCallback(() => {
    setDone(prev => {
      const next = { ...prev }
      freqItems.forEach(item => {
        delete next[doneKey(item.id, periodKey)]
      })
      saveDone(next)
      return next
    })
  }, [freqItems, periodKey])

  if (!hydrated) return null

  const freqCfg = FREQUENCY_CONFIG[activeFreq]
  const allDone = freqItems.length > 0 && completedCount === freqItems.length

  return (
    <div>
      <Header
        title="Meu Checklist"
        subtitle="Acompanhe suas ações recorrentes por frequência"
        action={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Nova Ação
          </Button>
        }
      />

      {/* Frequency Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-fit">
        {FREQUENCY_TABS.map(freq => {
          const cfg = FREQUENCY_CONFIG[freq]
          const isActive = freq === activeFreq
          const fItems = items.filter(i => i.frequency === freq)
          const fDone = fItems.filter(i => done[doneKey(i.id, getPeriodKey(freq))]).length
          return (
            <button
              key={freq}
              onClick={() => setActiveFreq(freq)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              {cfg.label}
              {fItems.length > 0 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {fDone}/{fItems.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Period Progress Card */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{periodLabel}</p>
              <p className="text-xs text-gray-500 mt-0.5">{freqCfg.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {allDone && freqItems.length > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Completo!
                </Badge>
              )}
              <span className="text-2xl font-bold text-gray-900">{progress}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {completedCount} de {freqItems.length} ações concluídas
            </span>
            {completedCount > 0 && (
              <button
                onClick={handleResetPeriod}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar período
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      {freqItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Nenhuma ação {FREQUENCY_CONFIG[activeFreq].label.toLowerCase()} cadastrada
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Clique em &quot;Nova Ação&quot; para adicionar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {CATEGORY_ORDER.map(cat => {
            const catItems = grouped[cat]
            if (catItems.length === 0) return null
            return (
              <CategoryGroup
                key={cat}
                category={cat}
                items={catItems}
                done={done}
                periodKey={periodKey}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddItemModal
          defaultFrequency={activeFreq}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
