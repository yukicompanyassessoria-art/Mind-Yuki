'use client'

import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Calendar,
  Youtube,
  Smartphone,
  Monitor,
  MessageCircle,
  Brain,
  Zap,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Status = 'disponivel' | 'requer_config' | 'workaround' | 'indisponivel'

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  status: Status
  summary: string
  details: string[]
  steps: string[]
  effort: 'baixo' | 'medio' | 'alto'
  timeEstimate: string
  officialApi: boolean
  link?: string
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  disponivel: {
    label: 'Disponível via API Oficial',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  requer_config: {
    label: 'Disponível · Requer Configuração',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
  },
  workaround: {
    label: 'Possível via Workaround',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
  },
  indisponivel: {
    label: 'Sem API Oficial',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <XCircle className="w-4 h-4 text-red-600" />,
  },
}

const EFFORT_CONFIG = {
  baixo: { label: 'Esforço Baixo', color: 'bg-green-100 text-green-700' },
  medio: { label: 'Esforço Médio', color: 'bg-amber-100 text-amber-700' },
  alto: { label: 'Esforço Alto', color: 'bg-red-100 text-red-700' },
}

// ─── Integrations data ─────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    status: 'requer_config',
    summary:
      'Sincronizar eventos da sua agenda direto no sistema. Veja o que acontece cada dia, categorize reuniões automaticamente e gere resumos de como você gastou seu tempo.',
    details: [
      'API oficial e gratuita (Google Calendar API v3)',
      'Leitura de todos os seus calendários (pessoal, trabalho, compartilhados)',
      'Categorização automática por palavras-chave do título (ex: "clinica" → Clientes)',
      'Geração de resumo semanal: % do tempo em reuniões vs foco',
      'Suporte a múltiplos calendários (separar pessoal de profissional)',
    ],
    steps: [
      '1. Criar projeto no Google Cloud Console (console.cloud.google.com)',
      '2. Habilitar a Google Calendar API',
      '3. Criar credenciais OAuth 2.0 (tipo: Web Application)',
      '4. Adicionar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local',
      '5. Implementar o fluxo OAuth2 no Next.js (NextAuth.js ou similar)',
      '6. Implementar leitura de eventos via GET /calendars/primary/events',
    ],
    effort: 'medio',
    timeEstimate: '1-2 dias de desenvolvimento',
    officialApi: true,
    link: 'https://developers.google.com/calendar/api/guides/overview',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="w-6 h-6 text-red-600" />,
    status: 'workaround',
    summary:
      'Ver o que você assiste no YouTube para entender quanto tempo gasta em conteúdo vs trabalho. O histórico completo não é acessível via API, mas há alternativas.',
    details: [
      'A YouTube Data API v3 NÃO expõe seu histórico de visualização',
      'O que é possível via API: vídeos curtidos, playlists salvas, canal inscrito',
      'MELHOR ALTERNATIVA: Google Takeout — exporta todo o histórico em JSON',
      'Você pode fazer upload manual do arquivo do Takeout no sistema para análise',
      'Outra opção: extensão de Chrome que captura o histórico localmente',
    ],
    steps: [
      '1. Acesse takeout.google.com e exporte apenas o YouTube',
      '2. Baixe o arquivo JSON com seu histórico de visualizações',
      '3. Faça upload no sistema (funcionalidade a criar em /integracoes/youtube)',
      '4. O sistema processa e categoriza os vídeos por tema e tempo assistido',
      '5. Alternativa mais automática: extensão de Chrome (ex: Daylio, RescueTime)',
    ],
    effort: 'medio',
    timeEstimate: 'Manual: imediato · Automático: 3-5 dias de dev',
    officialApi: false,
    link: 'https://takeout.google.com',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <MessageCircle className="w-6 h-6 text-green-600" />,
    status: 'indisponivel',
    summary:
      'WhatsApp pessoal NÃO tem API oficial pública. O WhatsApp Business API existe, mas é para contas comerciais, não pessoais. Veja as alternativas reais.',
    details: [
      'WhatsApp pessoal: NENHUMA API oficial disponível para leitura de mensagens',
      'WhatsApp Business API: apenas para envio de mensagens de negócios (não leitura)',
      'Bibliotecas não-oficiais (whatsapp-web.js) funcionam mas violam os Termos de Serviço — risco de banimento',
      'MELHOR ALTERNATIVA PRÁTICA: usar Make.com ou Zapier para capturar mensagens recebidas via WhatsApp Business',
      'Para métricas pessoais: usar o recurso nativo de Exportar Conversa do WhatsApp',
    ],
    steps: [
      '1. Para métrica de tempo: usar Screen Time do iPhone (veja abaixo)',
      '2. Para análise de conversas: WhatsApp > Configurações > Chats > Exportar Conversa',
      '3. Para automação via Make.com: criar uma conta Business e integrar via webhook',
      '4. Alternativa sem WhatsApp: usar o sistema de notas do 2º Cérebro para registrar resumos de conversas importantes',
    ],
    effort: 'alto',
    timeEstimate: 'Manual: imediato · Automação real: inviável sem conta Business',
    officialApi: false,
  },
  {
    id: 'mac-screen-time',
    name: 'Screen Time — Mac',
    icon: <Monitor className="w-6 h-6 text-gray-700" />,
    status: 'workaround',
    summary:
      'O macOS armazena dados de Screen Time em um banco SQLite local. É possível ler esses dados com um script e enviar para o sistema, mas requer configuração técnica.',
    details: [
      'Dados em: ~/Library/Application Support/com.apple.ScreenTime/RMAdminStore-Local.sqlite',
      'Banco SQLite com apps usados, tempo por app e URLs visitados',
      'Requer permissão de Acesso Total ao Disco nas Preferências do Sistema',
      'Alternativa mais simples e confiável: RescueTime (app gratuito/pago)',
      'RescueTime tem API oficial para ler seus dados de produtividade',
      'Outro: Timing.app — rastreamento automático muito detalhado para Mac',
    ],
    steps: [
      '1. OPÇÃO FÁCIL: instalar RescueTime (rescuetime.com) — rastreia automaticamente',
      '2. RescueTime tem API REST gratuita: gerar chave em rescuetime.com/anapi/manage',
      '3. Implementar no sistema: GET https://www.rescuetime.com/anapi/data com sua chave',
      '4. OPÇÃO TÉCNICA: script Python que lê o SQLite do Screen Time e envia via webhook',
      '5. Configurar launchd no Mac para rodar o script diariamente',
    ],
    effort: 'medio',
    timeEstimate: 'RescueTime: 1 dia · Script nativo: 2-3 dias',
    officialApi: false,
    link: 'https://www.rescuetime.com/anapi/manage',
  },
  {
    id: 'iphone-screen-time',
    name: 'Screen Time — iPhone',
    icon: <Smartphone className="w-6 h-6 text-gray-700" />,
    status: 'workaround',
    summary:
      'O iPhone não expõe dados de Screen Time via API. A estratégia é usar Atalhos (Shortcuts) do iOS para capturar dados e enviar para o sistema via webhook.',
    details: [
      'Apple não tem API pública para Screen Time de uso pessoal',
      'Os dados do iPhone sincronizam via iCloud com o Mac (mesmo banco SQLite)',
      'Atalhos do iOS pode capturar alguns dados comportamentais via automações',
      'MELHOR ALTERNATIVA: usar o app RescueTime no iPhone (versão iOS disponível)',
      'Outra opção: criar um atalho iOS que posta um resumo diário via webhook',
      'Dados do Screen Time do iPhone são visíveis no Mac via: Preferências > Screen Time',
    ],
    steps: [
      '1. OPÇÃO FÁCIL: instalar RescueTime no iPhone e conectar à mesma conta do Mac',
      '2. Alternativamente: criar uma Automação no app Atalhos do iPhone',
      '3. Atalho sugerido: todo dia às 23h, posta resumo de apps usados via webhook POST',
      '4. Configurar uma rota de API no sistema para receber esses dados',
      '5. Para relatório manual: Ajustes > Screen Time > Ver Todos os Dados de Atividade',
    ],
    effort: 'alto',
    timeEstimate: 'RescueTime: imediato · Atalho iOS: 1 dia de config',
    officialApi: false,
  },
]

// ─── Second Brain Roadmap ─────────────────────────────────────────────────────

const BRAIN_MODULES = [
  {
    id: 'notas',
    title: 'Diário & Life Log',
    desc: 'Registre cada dia: o que aconteceu, como se sentiu, decisões tomadas. Revisitável por data, tag e humor.',
    status: 'proximo' as const,
    icon: '📓',
  },
  {
    id: 'aprendizados',
    title: 'Aprendizados de Vida',
    desc: 'Livros lidos, insights de reuniões, lições aprendidas. Com busca rápida e revisão periódica.',
    status: 'proximo' as const,
    icon: '💡',
  },
  {
    id: 'senhas',
    title: 'Cofre de Senhas',
    desc: 'Senhas e credenciais criptografadas localmente (AES-256). Nunca saem do seu dispositivo.',
    status: 'proximo' as const,
    icon: '🔐',
  },
  {
    id: 'direcao',
    title: 'Direção & Propósito',
    desc: 'Seus valores, missão pessoal, objetivos de vida. Revisado mensalmente para verificar alinhamento.',
    status: 'proximo' as const,
    icon: '🧭',
  },
  {
    id: 'contatos',
    title: 'CRM Pessoal',
    desc: 'Registro de pessoas importantes: clientes, parceiros, mentores — com histórico de interações.',
    status: 'futuro' as const,
    icon: '🤝',
  },
  {
    id: 'resumos-ia',
    title: 'Resumos com IA (Claude)',
    desc: 'Análise semanal automática da sua agenda, checklist e metas. Score de foco, alertas de desvio.',
    status: 'futuro' as const,
    icon: '🤖',
  },
]

// ─── Components ────────────────────────────────────────────────────────────────

function IntegrationCard({ integration }: { integration: Integration }) {
  const status = STATUS_CONFIG[integration.status]
  const effort = EFFORT_CONFIG[integration.effort]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              {integration.icon}
            </div>
            <div>
              <CardTitle>{integration.name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-1">
                {status.icon}
                <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            <Badge className={effort.color + ' border-transparent'}>{effort.label}</Badge>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {integration.timeEstimate}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <p className="text-sm text-gray-600 mb-4">{integration.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What's possible */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              O que é possível
            </p>
            <ul className="space-y-1.5">
              {integration.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* How to implement */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Como implementar
            </p>
            <ol className="space-y-1.5">
              {integration.steps.map((s, i) => (
                <li key={i} className="text-xs text-gray-600">
                  {s}
                </li>
              ))}
            </ol>
            {integration.link && (
              <a
                href={integration.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                Documentação oficial
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {!integration.officialApi && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium">
              ⚠ Esta integração não tem API oficial. As alternativas acima são as melhores
              opções disponíveis — algumas podem mudar com atualizações dos serviços.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IntegracoesPage() {
  return (
    <div>
      <Header
        title="Integrações & 2º Cérebro"
        subtitle="Roadmap técnico para conectar sua vida digital ao sistema"
      />

      {/* Priority recommendation */}
      <Card className="mb-6 bg-violet-50 border-violet-200">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-violet-900 mb-1">Sequência recomendada</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-violet-700">
                <span className="font-semibold bg-white px-2 py-1 rounded-lg border border-violet-200">
                  1. 2º Cérebro (base)
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold bg-white px-2 py-1 rounded-lg border border-violet-200">
                  2. Google Calendar
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold bg-white px-2 py-1 rounded-lg border border-violet-200">
                  3. RescueTime (Mac + iPhone)
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold bg-white px-2 py-1 rounded-lg border border-violet-200">
                  4. Resumos com IA (Claude API)
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold bg-white px-2 py-1 rounded-lg border border-violet-200">
                  5. YouTube Takeout
                </span>
              </div>
              <p className="text-xs text-violet-600 mt-2">
                WhatsApp pessoal não tem solução oficial. Recomendo usar o módulo de Life Log do 2º Cérebro
                para registrar manualmente decisões e conversas importantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Brain Roadmap */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-violet-600" />
          <h2 className="text-base font-bold text-gray-900">2º Cérebro — Módulos a Construir</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRAIN_MODULES.map(mod => (
            <div
              key={mod.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                mod.status === 'proximo'
                  ? 'bg-white border-violet-200 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{mod.icon}</span>
                  <p className="text-sm font-semibold text-gray-900">{mod.title}</p>
                </div>
                <Badge
                  className={
                    mod.status === 'proximo'
                      ? 'bg-violet-100 text-violet-700 border-violet-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }
                >
                  {mod.status === 'proximo' ? 'Próximo' : 'Fase 2'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-violet-600" />
          <h2 className="text-base font-bold text-gray-900">Integrações Externas — Roadmap Técnico</h2>
        </div>
        <div className="space-y-4">
          {INTEGRATIONS.map(integration => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>
    </div>
  )
}
