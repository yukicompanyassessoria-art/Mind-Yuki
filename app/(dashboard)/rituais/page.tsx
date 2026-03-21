'use client'

import { RITUALS, DEPARTMENTS, USERS } from '@/lib/mock-data'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Plus } from 'lucide-react'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const FREQUENCY_LABELS: Record<string, string> = {
  diario: 'Diário',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
}

const FREQUENCY_COLORS: Record<string, string> = {
  diario: 'text-violet-700 bg-violet-50 border-violet-200',
  semanal: 'text-blue-700 bg-blue-50 border-blue-200',
  quinzenal: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  mensal: 'text-amber-700 bg-amber-50 border-amber-200',
  trimestral: 'text-rose-700 bg-rose-50 border-rose-200',
}

export default function RituaisPage() {
  const grouped = {
    diario: RITUALS.filter(r => r.frequency === 'diario'),
    semanal: RITUALS.filter(r => r.frequency === 'semanal'),
    quinzenal: RITUALS.filter(r => r.frequency === 'quinzenal'),
    mensal: RITUALS.filter(r => r.frequency === 'mensal'),
    trimestral: RITUALS.filter(r => r.frequency === 'trimestral'),
  }

  return (
    <div>
      <Header
        title="Rituais de Gestão"
        subtitle="Cadência de reuniões e cerimônias da Yuki"
        action={
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Novo Ritual
          </Button>
        }
      />

      {/* Weekly view hint */}
      <Card className="mb-6 bg-violet-50 border-violet-200">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">Cadência da Semana</p>
              <p className="text-xs text-violet-600 mt-0.5">
                Seg: Marketing + Comercial · Ter: Operacional · Qua: Financeiro · Diário: Daily Liderança (08:30)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(grouped).map(([freq, rituals]) => {
          if (rituals.length === 0) return null
          return (
            <div key={freq}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-700">{FREQUENCY_LABELS[freq]}</h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{rituals.length} ritual{rituals.length > 1 ? 'is' : ''}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rituals.map(ritual => {
                  const dept = ritual.department_id ? DEPARTMENTS.find(d => d.id === ritual.department_id) : null
                  const responsible = USERS.find(u => u.id === ritual.responsible_user_id)
                  const participantUsers = USERS.filter(u => ritual.participants.includes(u.id))

                  return (
                    <Card key={ritual.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{ritual.name}</h3>
                          <Badge className={FREQUENCY_COLORS[ritual.frequency]}>
                            {FREQUENCY_LABELS[ritual.frequency]}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-gray-500">
                          {ritual.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {ritual.day_of_week !== undefined ? `${DAYS[ritual.day_of_week]}, ` : ''}{ritual.time}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{dept ? dept.name : 'Toda a empresa'}</span>
                          </div>
                          {responsible && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-400">DRI:</span>
                              <span className="font-medium text-gray-600">{responsible.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400 mr-1">Participantes:</span>
                          {participantUsers.slice(0, 4).map(u => (
                            <Avatar key={u.id} name={u.name} size="sm" />
                          ))}
                          {participantUsers.length > 4 && (
                            <span className="text-xs text-gray-400 ml-1">+{participantUsers.length - 4}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
