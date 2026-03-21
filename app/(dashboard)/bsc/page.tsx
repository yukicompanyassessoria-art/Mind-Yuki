'use client'

import { useState } from 'react'
import { BSC_ENTRIES, DEPARTMENTS, USERS } from '@/lib/mock-data'
import { BSCEntry, BSCCategory } from '@/types'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrafficLightBadge } from '@/components/ui/traffic-light'
import { calcTrafficLight } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'

const CATEGORIES: { id: BSCCategory; label: string; color: string }[] = [
  { id: 'financeiro', label: 'Financeiro', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'clientes', label: 'Clientes', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'processos', label: 'Processos Internos', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  { id: 'aprendizado', label: 'Aprendizado & Crescimento', color: 'text-amber-700 bg-amber-50 border-amber-200' },
]

function BSCTable({ entries, category }: { entries: BSCEntry[]; category: typeof CATEGORIES[0] }) {
  const filtered = entries.filter(e => e.category === category.id)
  if (filtered.length === 0) return null

  return (
    <div className="mb-4">
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${category.color}`}>
        {category.label}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Indicador</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2 px-3">Meta</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2 px-3">Realizado</th>
              <th className="text-center text-xs font-medium text-gray-400 pb-2 pl-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(entry => {
              // For metrics where lower is better (CAC, Churn, Tempo)
              const lowerIsBetter = ['CAC', 'Churn', 'Tempo'].some(k => entry.indicator.includes(k))
              const tl = lowerIsBetter
                ? calcTrafficLight(entry.target, entry.actual) // inverted
                : entry.traffic_light
              const progress = entry.target > 0 ? (entry.actual / entry.target) * 100 : 0

              return (
                <tr key={entry.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-gray-900">{entry.indicator}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-500">
                    {entry.target.toLocaleString('pt-BR')} {entry.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-semibold ${
                      tl === 'verde' ? 'text-emerald-600' :
                      tl === 'amarelo' ? 'text-amber-600' :
                      tl === 'vermelho' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {entry.actual.toLocaleString('pt-BR')} {entry.unit}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 text-center">
                    <TrafficLightBadge status={tl} size="sm" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DeptBSC({ deptId, deptName }: { deptId: string; deptName: string }) {
  const entries = BSC_ENTRIES.filter(e => e.department_id === deptId)
  if (entries.length === 0) return null

  const red = entries.filter(e => e.traffic_light === 'vermelho').length
  const yellow = entries.filter(e => e.traffic_light === 'amarelo').length
  const green = entries.filter(e => e.traffic_light === 'verde').length
  const overallHealth = red > 0 ? 'vermelho' : yellow > green ? 'amarelo' : 'verde'

  const head = DEPARTMENTS.find(d => d.id === deptId)
  const headUser = USERS.find(u => u.id === head?.head_id)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{deptName}</CardTitle>
            {headUser && <p className="text-xs text-gray-400 mt-0.5">Head: {headUser.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">
              <span className="text-emerald-600 font-medium">{green}↑</span>
              {' '}<span className="text-amber-500 font-medium">{yellow}~</span>
              {' '}<span className="text-red-500 font-medium">{red}↓</span>
            </div>
            <TrafficLightBadge status={overallHealth} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {CATEGORIES.map(cat => (
          <BSCTable key={cat.id} entries={entries} category={cat} />
        ))}
      </CardContent>
    </Card>
  )
}

export default function BSCPage() {
  const [period, setPeriod] = useState('2026-03')
  const activeDepts = DEPARTMENTS.filter(d => d.status === 'ativo')

  // Overall health
  const all = BSC_ENTRIES.filter(e => e.period === period)
  const redCount = all.filter(e => e.traffic_light === 'vermelho').length
  const yellowCount = all.filter(e => e.traffic_light === 'amarelo').length
  const greenCount = all.filter(e => e.traffic_light === 'verde').length

  return (
    <div>
      <Header
        title="BSC por Área"
        subtitle="Balanced Scorecard — Indicadores de Performance por Departamento"
        action={
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="2026-03">Março 2026</option>
            <option value="2026-04">Abril 2026</option>
            <option value="2026-05">Maio 2026</option>
            <option value="2026-06">Junho 2026</option>
          </select>
        }
      />

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{greenCount}</p>
              <p className="text-xs text-gray-400">No Verde</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{yellowCount}</p>
              <p className="text-xs text-gray-400">Em Atenção</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{redCount}</p>
              <p className="text-xs text-gray-400">Em Alerta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dept BSCs */}
      <div className="space-y-6">
        {activeDepts.map(dept => (
          <DeptBSC key={dept.id} deptId={dept.id} deptName={dept.name} />
        ))}
      </div>
    </div>
  )
}
