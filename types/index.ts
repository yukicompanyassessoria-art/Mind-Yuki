export type UserRole = 'socio_gestor' | 'socio' | 'head' | 'auxiliar'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
}

export type DepartmentStatus = 'ativo' | 'planejado'

export interface Department {
  id: string
  name: string
  status: DepartmentStatus
  head_id?: string
}

export type NCTStatus = 'nao_iniciado' | 'em_andamento' | 'atrasado' | 'concluido'
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface NCT {
  id: string
  title: string
  description?: string
  department_id: string
  dri_user_id: string
  quarter: Quarter
  year: number
  status: NCTStatus
  progress: number // 0-100
  created_at: string
  updated_at: string
}

export interface KPI {
  id: string
  nct_id: string
  title: string
  unit: string
  target: number
  actual: number
  frequency: 'diario' | 'semanal' | 'mensal'
}

export interface Commitment {
  id: string
  nct_id: string
  title: string
  due_date: string
  status: 'pendente' | 'concluido' | 'atrasado'
  responsible_user_id: string
  week: number
}

export type BSCCategory = 'financeiro' | 'clientes' | 'processos' | 'aprendizado'
export type TrafficLight = 'verde' | 'amarelo' | 'vermelho' | 'cinza'

export interface BSCEntry {
  id: string
  department_id: string
  category: BSCCategory
  indicator: string
  target: number
  actual: number
  unit: string
  period: string // 'YYYY-MM'
  traffic_light: TrafficLight
}

export interface Ritual {
  id: string
  name: string
  frequency: 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral'
  day_of_week?: number // 0-6
  time?: string
  department_id?: string // null = empresa toda
  responsible_user_id: string
  participants: string[]
  is_active: boolean
}

export interface Goal {
  id: string
  title: string
  type: 'anual' | 'trimestral' | 'mensal'
  year: number
  quarter?: Quarter
  month?: number
  department_id?: string
  target: number
  actual: number
  unit: string
  traffic_light: TrafficLight
}

export type ChecklistFrequency = 'semanal' | 'mensal' | 'trimestral' | 'anual'

export type ChecklistCategory =
  | 'reuniao_clientes'
  | 'reuniao_time'
  | 'reuniao_novos_clientes'
  | 'reuniao_parceiros'
  | 'reuniao_socio'
  | 'operacional'
  | 'marketing'
  | 'estrategia'
  | 'financeiro'
  | 'outros'

export interface ChecklistItem {
  id: string
  title: string
  frequency: ChecklistFrequency
  category: ChecklistCategory
  order: number
  created_at: string
}
