'use client'

import { USERS, DEPARTMENTS, NCTS } from '@/lib/mock-data'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Users, Building2 } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  socio_gestor: 'Sócio Gestor',
  socio: 'Sócio',
  head: 'Head',
  auxiliar: 'Auxiliar Administrativa',
}

const ROLE_COLORS: Record<string, string> = {
  socio_gestor: 'text-violet-700 bg-violet-50 border-violet-200',
  socio: 'text-blue-700 bg-blue-50 border-blue-200',
  head: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  auxiliar: 'text-gray-600 bg-gray-50 border-gray-200',
}

export default function TimePage() {
  const leadership = USERS

  return (
    <div>
      <Header
        title="Time"
        subtitle="Estrutura de liderança Yuki — 26 pessoas no total"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: 26, icon: Users, color: 'text-gray-900' },
          { label: 'Liderança', value: 6, icon: Users, color: 'text-violet-600' },
          { label: 'Operação', value: 20, icon: Users, color: 'text-blue-600' },
          { label: 'Áreas Ativas', value: 4, icon: Building2, color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leadership Cards */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Liderança</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {leadership.map(user => {
          const dept = DEPARTMENTS.find(d => d.head_id === user.id)
          const myNCTs = NCTS.filter(n => n.dri_user_id === user.id && n.quarter === 'Q2' && n.year === 2026)
          const doneNCTs = myNCTs.filter(n => n.status === 'concluido').length
          const avgProgress = myNCTs.length > 0
            ? myNCTs.reduce((sum, n) => sum + n.progress, 0) / myNCTs.length
            : 0

          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={user.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <Badge className={`mt-1 ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </div>

                {dept && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Head de {dept.name}</span>
                  </div>
                )}

                {myNCTs.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">NCTs Q2 — {doneNCTs}/{myNCTs.length} concluídas</span>
                      <span className="font-medium text-gray-700">{Math.round(avgProgress)}%</span>
                    </div>
                    <Progress value={avgProgress} />
                  </div>
                )}

                {myNCTs.length === 0 && (
                  <p className="text-xs text-gray-400 pt-3 border-t border-gray-100 text-center">
                    Sem NCTs atribuídas este trimestre
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Org Structure */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Estrutura Organizacional</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active */}
        <Card>
          <CardContent className="pt-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Departamentos Ativos (R$ 500k/mês)
            </h3>
            <div className="space-y-2">
              {DEPARTMENTS.filter(d => d.status === 'ativo').map(dept => {
                const head = USERS.find(u => u.id === dept.head_id)
                return (
                  <div key={dept.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    {head ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={head.name} size="sm" />
                        <span className="text-xs text-gray-400">{head.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sem head definido</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Planned */}
        <Card>
          <CardContent className="pt-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              Estrutura Para R$ 2MM/mês
            </h3>
            <p className="text-xs text-gray-400 mb-3">Departamentos a criar/formalizar</p>
            <div className="space-y-2">
              {DEPARTMENTS.filter(d => d.status === 'planejado').map(dept => (
                <div key={dept.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{dept.name}</span>
                  <Badge className="text-gray-500 bg-gray-50 border-gray-200 text-xs">Planejado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
