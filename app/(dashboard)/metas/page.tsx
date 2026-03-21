'use client'

import { GOALS } from '@/lib/mock-data'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrafficLightBadge } from '@/components/ui/traffic-light'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, quarterLabel } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

function GoalRow({ goal }: { goal: typeof GOALS[0] }) {
  const progress = goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
  const isRevenue = goal.unit === 'R$/mês' || goal.unit === 'R$'

  const format = (v: number) => isRevenue ? formatCurrency(v) : `${v.toLocaleString('pt-BR')} ${goal.unit}`

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{goal.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {format(goal.actual)} / {format(goal.target)}
          </span>
          <TrafficLightBadge status={goal.traffic_light} size="sm" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="text-xs font-medium text-gray-500 w-10 text-right">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default function MetasPage() {
  const annual = GOALS.filter(g => g.type === 'anual')
  const quarterly = GOALS.filter(g => g.type === 'trimestral')
  const monthly = GOALS.filter(g => g.type === 'mensal')

  // Group quarterly by quarter
  const quarters = [...new Set(quarterly.map(g => g.quarter).filter(Boolean))]

  return (
    <div>
      <Header
        title="Metas"
        subtitle="Objetivos estratégicos Yuki 2026 — rumo a R$ 2MM/mês"
      />

      {/* Journey Banner */}
      <Card className="mb-6 bg-gradient-to-r from-violet-600 to-violet-800 border-0 text-white">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-sm font-medium">Jornada de Crescimento 2026</p>
              <p className="text-3xl font-bold mt-1">R$ 500k → R$ 2MM</p>
              <p className="text-violet-200 text-sm mt-1">Crescimento de 4x no MRR</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">25%</div>
              <p className="text-violet-200 text-sm">do caminho percorrido</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-3 bg-violet-900/50 rounded-full">
              <div className="h-full bg-white rounded-full" style={{ width: '25%' }} />
            </div>
            <div className="flex justify-between text-xs text-violet-200 mt-1.5">
              <span>Jan 2026</span>
              <span>Dez 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              Metas Anuais — 2026
              <Badge className="text-violet-700 bg-violet-50 border-violet-200 ml-auto">Anual</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {annual.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhuma meta anual definida</p>
            ) : (
              annual.map(goal => <GoalRow key={goal.id} goal={goal} />)
            )}
          </CardContent>
        </Card>

        {/* Quarterly */}
        <div className="space-y-6">
          {quarters.map(q => (
            <Card key={q}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  {q && quarterLabel(q)} — 2026
                  <Badge className="text-blue-700 bg-blue-50 border-blue-200 ml-auto">Trimestral</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {quarterly
                  .filter(g => g.quarter === q)
                  .map(goal => <GoalRow key={goal.id} goal={goal} />)}
              </CardContent>
            </Card>
          ))}

          {monthly.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Metas Mensais
                  <Badge className="text-amber-700 bg-amber-50 border-amber-200 ml-auto">Mensal</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {monthly.map(goal => <GoalRow key={goal.id} goal={goal} />)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
