'use client'

import { NCTS, GOALS, BSC_ENTRIES, DEPARTMENTS, USERS } from '@/lib/mock-data'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrafficLightBadge, TrafficLightDot } from '@/components/ui/traffic-light'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, statusLabel, calcTrafficLight } from '@/lib/utils'
import { TrendingUp, Target, BarChart3, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const quarter = 'Q2'
  const year = 2026

  const quarterNCTs = NCTS.filter(n => n.quarter === quarter && n.year === year)
  const totalNCTs = quarterNCTs.length
  const doneNCTs = quarterNCTs.filter(n => n.status === 'concluido').length
  const atrasadoNCTs = quarterNCTs.filter(n => n.status === 'atrasado').length

  const mrr = GOALS.find(g => g.title === 'MRR' && g.type === 'anual')
  const mrrProgress = mrr ? (mrr.actual / mrr.target) * 100 : 0

  // Department health via BSC
  const activeDepts = DEPARTMENTS.filter(d => d.status === 'ativo')

  function deptHealth(deptId: string) {
    const entries = BSC_ENTRIES.filter(e => e.department_id === deptId)
    if (!entries.length) return 'cinza' as const
    const red = entries.filter(e => e.traffic_light === 'vermelho').length
    const yellow = entries.filter(e => e.traffic_light === 'amarelo').length
    if (red > 0) return 'vermelho' as const
    if (yellow > entries.length / 2) return 'amarelo' as const
    return 'verde' as const
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div>
      <Header
        title={`${greeting()}, ${user?.name} 👋`}
        subtitle={`Dashboard Executivo — Q2 2026 · Foco: R$ 500k → R$ 2MM/mês`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="MRR Atual"
          value={formatCurrency(500000)}
          sub="Meta: R$ 2MM/mês"
          color="text-violet-600"
        />
        <StatCard
          label="NCTs do Trimestre"
          value={`${totalNCTs} NCTs`}
          sub={`${doneNCTs} concluídas · ${atrasadoNCTs} atrasadas`}
          color="text-gray-900"
        />
        <StatCard
          label="Time"
          value="26 pessoas"
          sub="6 liderança · 20 operação"
          color="text-gray-900"
        />
        <StatCard
          label="Jornada de Crescimento"
          value={`${Math.round(mrrProgress)}%`}
          sub="Rumo ao target de 2MM"
          color={mrrProgress >= 100 ? 'text-emerald-600' : mrrProgress >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* NCTs Status */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  NCTs — Q2 2026
                </CardTitle>
                <Link href="/ncts" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  Ver todas <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {quarterNCTs.map(nct => {
                  const dri = USERS.find(u => u.id === nct.dri_user_id)
                  const dept = DEPARTMENTS.find(d => d.id === nct.department_id)
                  return (
                    <div key={nct.id} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">{nct.title}</span>
                          <Badge className={
                            nct.status === 'concluido' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                            nct.status === 'atrasado' ? 'text-red-700 bg-red-50 border-red-200' :
                            nct.status === 'em_andamento' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                            'text-gray-600 bg-gray-50 border-gray-200'
                          }>
                            {statusLabel(nct.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={nct.progress} className="flex-1 max-w-32" />
                          <span className="text-xs text-gray-400">{nct.progress}%</span>
                          <span className="text-xs text-gray-400">{dept?.name}</span>
                        </div>
                      </div>
                      {dri && <Avatar name={dri.name} size="sm" />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dept Health */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-600" />
                Saúde por Área
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {activeDepts.map(dept => {
                  const health = deptHealth(dept.id)
                  const head = USERS.find(u => u.id === dept.head_id)
                  return (
                    <div key={dept.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <TrafficLightDot status={health} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                          {head && <p className="text-xs text-gray-400">{head.name}</p>}
                        </div>
                      </div>
                      <TrafficLightBadge status={health} size="sm" />
                    </div>
                  )
                })}
                <div className="pt-2">
                  <p className="text-xs text-gray-400 font-medium mb-2">Departamentos Planejados</p>
                  {DEPARTMENTS.filter(d => d.status === 'planejado').map(dept => (
                    <div key={dept.id} className="flex items-center gap-2 py-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                      <span className="text-xs text-gray-400">{dept.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Goals + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                Metas Estratégicas 2026
              </CardTitle>
              <Link href="/metas" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {GOALS.filter(g => g.type === 'anual').map(goal => {
                const progress = goal.target > 0 ? (goal.actual / goal.target) * 100 : 0
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {goal.unit === 'R$/mês' ? formatCurrency(goal.actual) : goal.actual} / {goal.unit === 'R$/mês' ? formatCurrency(goal.target) : `${goal.target}${goal.unit}`}
                        </span>
                        <TrafficLightBadge status={goal.traffic_light} size="sm" />
                      </div>
                    </div>
                    <Progress value={progress} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leadership Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Liderança
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {USERS.filter(u => u.role !== 'auxiliar').map(u => {
                const roleLabel: Record<string, string> = {
                  socio_gestor: 'Sócio Gestor',
                  socio: 'Sócio',
                  head: 'Head',
                  auxiliar: 'Auxiliar',
                }
                const dept = DEPARTMENTS.find(d => d.head_id === u.id)
                const myNCTs = NCTS.filter(n => n.dri_user_id === u.id && n.quarter === 'Q2' && n.year === 2026)
                return (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <Avatar name={u.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{roleLabel[u.role]}{dept ? ` · ${dept.name}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{myNCTs.length}</p>
                      <p className="text-xs text-gray-400">NCTs</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
