'use client'

import { useState } from 'react'
import { NCTS, DEPARTMENTS, USERS, KPIS, COMMITMENTS } from '@/lib/mock-data'
import { NCT, Department } from '@/types'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TrafficLightBadge } from '@/components/ui/traffic-light'
import { statusLabel, statusColor, calcTrafficLight } from '@/lib/utils'
import { Target, ChevronDown, ChevronUp, Users, TrendingUp, CheckSquare } from 'lucide-react'

function NCTCard({ nct }: { nct: NCT }) {
  const [expanded, setExpanded] = useState(false)
  const dept = DEPARTMENTS.find(d => d.id === nct.department_id)
  const dri = USERS.find(u => u.id === nct.dri_user_id)
  const kpis = KPIS.filter(k => k.nct_id === nct.id)
  const commitments = COMMITMENTS.filter(c => c.nct_id === nct.id)

  const trafficLight = calcTrafficLight(nct.progress, 100)

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status bar */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
          nct.status === 'concluido' ? 'bg-emerald-500' :
          nct.status === 'atrasado' ? 'bg-red-500' :
          nct.status === 'em_andamento' ? 'bg-blue-500' :
          'bg-gray-300'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">{nct.title}</h3>
                <Badge className={statusColor(nct.status)}>{statusLabel(nct.status)}</Badge>
                <Badge className="text-violet-700 bg-violet-50 border-violet-200">{dept?.name}</Badge>
              </div>
              {nct.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{nct.description}</p>
              )}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-48">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{nct.progress}%</span>
                  </div>
                  <Progress value={nct.progress} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {kpis.length} KPIs
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    {commitments.length} entregas
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {dri && (
                <div className="flex items-center gap-2">
                  <Avatar name={dri.name} size="sm" />
                  <span className="text-xs text-gray-500 hidden sm:block">{dri.name}</span>
                </div>
              )}
              <TrafficLightBadge status={trafficLight} size="sm" />
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KPIs */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                KPIs
              </h4>
              {kpis.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum KPI definido</p>
              ) : (
                <div className="space-y-3">
                  {kpis.map(kpi => {
                    const progress = kpi.target > 0 ? (kpi.actual / kpi.target) * 100 : 0
                    const tl = calcTrafficLight(kpi.actual, kpi.target)
                    return (
                      <div key={kpi.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">{kpi.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {kpi.actual}/{kpi.target} {kpi.unit}
                            </span>
                            <TrafficLightBadge status={tl} size="sm" />
                          </div>
                        </div>
                        <Progress value={progress} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Commitments */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5" />
                Entregas / Compromissos
              </h4>
              {commitments.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum compromisso definido</p>
              ) : (
                <div className="space-y-2">
                  {commitments.map(c => {
                    const resp = USERS.find(u => u.id === c.responsible_user_id)
                    const dueDate = new Date(c.due_date)
                    const isOverdue = dueDate < new Date() && c.status === 'pendente'
                    return (
                      <div key={c.id} className="flex items-start gap-2.5 py-1.5">
                        <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${
                          c.status === 'concluido' ? 'bg-emerald-500 border-emerald-500' :
                          isOverdue ? 'border-red-400' : 'border-gray-300'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${c.status === 'concluido' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {c.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                              {dueDate.toLocaleDateString('pt-BR')}
                            </span>
                            {resp && <span className="text-xs text-gray-400">· {resp.name}</span>}
                          </div>
                        </div>
                        <Badge className={statusColor(isOverdue ? 'atrasado' : c.status)} >
                          {statusLabel(isOverdue ? 'atrasado' : c.status)}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function NCTsPage() {
  const [filterDept, setFilterDept] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const activeDepts = DEPARTMENTS.filter(d => d.status === 'ativo')

  const filtered = NCTS.filter(n => {
    if (filterDept !== 'all' && n.department_id !== filterDept) return false
    if (filterStatus !== 'all' && n.status !== filterStatus) return false
    return true
  })

  return (
    <div>
      <Header
        title="NCTs & Entregas"
        subtitle="Não Conformidades & Tarefas Críticas — Q2 2026"
        action={
          <Button size="sm">
            <Target className="w-4 h-4" />
            Nova NCT
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', count: NCTS.length, color: 'text-gray-900' },
          { label: 'Em Andamento', count: NCTS.filter(n => n.status === 'em_andamento').length, color: 'text-blue-600' },
          { label: 'Não Iniciado', count: NCTS.filter(n => n.status === 'nao_iniciado').length, color: 'text-gray-500' },
          { label: 'Atrasado', count: NCTS.filter(n => n.status === 'atrasado').length, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">Todas as Áreas</option>
          {activeDepts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">Todos os Status</option>
          <option value="nao_iniciado">Não Iniciado</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="atrasado">Atrasado</option>
          <option value="concluido">Concluído</option>
        </select>
        <span className="text-sm text-gray-400">{filtered.length} NCTs</span>
      </div>

      {/* NCT List */}
      <div className="space-y-3">
        {filtered.map(nct => (
          <NCTCard key={nct.id} nct={nct} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhuma NCT encontrada para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  )
}
