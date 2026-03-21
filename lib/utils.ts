import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TrafficLight } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trafficLightColor(light: TrafficLight): string {
  const map = {
    verde: 'bg-emerald-500',
    amarelo: 'bg-amber-400',
    vermelho: 'bg-red-500',
    cinza: 'bg-gray-400',
  }
  return map[light]
}

export function trafficLightText(light: TrafficLight): string {
  const map = {
    verde: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amarelo: 'text-amber-700 bg-amber-50 border-amber-200',
    vermelho: 'text-red-700 bg-red-50 border-red-200',
    cinza: 'text-gray-600 bg-gray-50 border-gray-200',
  }
  return map[light]
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    nao_iniciado: 'text-gray-600 bg-gray-50 border-gray-200',
    em_andamento: 'text-blue-700 bg-blue-50 border-blue-200',
    atrasado: 'text-red-700 bg-red-50 border-red-200',
    concluido: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    pendente: 'text-amber-700 bg-amber-50 border-amber-200',
  }
  return map[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    nao_iniciado: 'Não Iniciado',
    em_andamento: 'Em Andamento',
    atrasado: 'Atrasado',
    concluido: 'Concluído',
    pendente: 'Pendente',
    ativo: 'Ativo',
    planejado: 'Planejado',
  }
  return map[status] || status
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function quarterLabel(quarter: string): string {
  const map: Record<string, string> = {
    Q1: '1º Trimestre',
    Q2: '2º Trimestre',
    Q3: '3º Trimestre',
    Q4: '4º Trimestre',
  }
  return map[quarter] || quarter
}

export function calcTrafficLight(actual: number, target: number): TrafficLight {
  if (target === 0) return 'cinza'
  const ratio = actual / target
  if (ratio >= 1) return 'verde'
  if (ratio >= 0.7) return 'amarelo'
  return 'vermelho'
}
