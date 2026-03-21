import { User, Department, NCT, KPI, Commitment, BSCEntry, Ritual, Goal } from '@/types'

export const USERS: User[] = [
  { id: 'victor', name: 'Victor', email: 'victor@yuki.com.br', role: 'socio_gestor', department: 'all' },
  { id: 'gustavo', name: 'Gustavo', email: 'gustavo@yuki.com.br', role: 'socio', department: 'marketing' },
  { id: 'erika', name: 'Érika', email: 'erika@yuki.com.br', role: 'head', department: 'financeiro' },
  { id: 'nicolas', name: 'Nicolas', email: 'nicolas@yuki.com.br', role: 'head', department: 'operacional' },
  { id: 'antonio', name: 'Antonio', email: 'antonio@yuki.com.br', role: 'head', department: 'comercial' },
  { id: 'gabriela', name: 'Gabriela', email: 'gabriela@yuki.com.br', role: 'auxiliar', department: 'all' },
]

export const DEPARTMENTS: Department[] = [
  { id: 'marketing', name: 'Marketing', status: 'ativo', head_id: 'gustavo' },
  { id: 'comercial', name: 'Comercial', status: 'ativo', head_id: 'antonio' },
  { id: 'operacional', name: 'Operacional', status: 'ativo', head_id: 'nicolas' },
  { id: 'financeiro', name: 'Financeiro', status: 'ativo', head_id: 'erika' },
  { id: 'rh', name: 'RH', status: 'planejado' },
  { id: 'juridico', name: 'Jurídico', status: 'planejado' },
  { id: 'facilities', name: 'Facilities & People', status: 'planejado' },
  { id: 'pd', name: 'P&D', status: 'planejado' },
  { id: 'trainee', name: 'Trainee', status: 'planejado' },
]

export const NCTS: NCT[] = [
  {
    id: 'nct-1',
    title: 'Embaixadores Premium',
    description: 'Ter de 4-6 clientes no formato de embaixadores com investimento médio por perfil de R$ 10-15k',
    department_id: 'marketing',
    dri_user_id: 'gustavo',
    quarter: 'Q2',
    year: 2026,
    status: 'em_andamento',
    progress: 20,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-2',
    title: 'Conteúdo Diário Yuki',
    description: 'Postar de 3-5 posts por dia no perfil da Yuki',
    department_id: 'marketing',
    dri_user_id: 'gustavo',
    quarter: 'Q2',
    year: 2026,
    status: 'em_andamento',
    progress: 35,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-3',
    title: 'Conteúdo Diário Sócios',
    description: 'Postar de 1-3 posts por dia no perfil dos sócios',
    department_id: 'marketing',
    dri_user_id: 'gustavo',
    quarter: 'Q2',
    year: 2026,
    status: 'em_andamento',
    progress: 30,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-4',
    title: 'Evento Interno de Cultura',
    description: 'Evento interno para fortalecimento de cultura com toda a equipe',
    department_id: 'operacional',
    dri_user_id: 'victor',
    quarter: 'Q2',
    year: 2026,
    status: 'nao_iniciado',
    progress: 0,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-5',
    title: 'Off-site Executivo — Revisão OKR',
    description: 'Off-site com os principais executivos por área para revisão de OKR e clareza de para onde a empresa está indo',
    department_id: 'operacional',
    dri_user_id: 'victor',
    quarter: 'Q2',
    year: 2026,
    status: 'nao_iniciado',
    progress: 0,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-6',
    title: 'Protocolo de Atendimento 1:10',
    description: 'Testar atendimento 1 por 10 no operacional — escalar eficiência de atendimento',
    department_id: 'operacional',
    dri_user_id: 'nicolas',
    quarter: 'Q2',
    year: 2026,
    status: 'nao_iniciado',
    progress: 0,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
  {
    id: 'nct-7',
    title: 'Área de Membros Operacional',
    description: 'Criar área de membros operacional — hub central de operações',
    department_id: 'operacional',
    dri_user_id: 'nicolas',
    quarter: 'Q2',
    year: 2026,
    status: 'nao_iniciado',
    progress: 0,
    created_at: '2026-03-01',
    updated_at: '2026-03-21',
  },
]

export const KPIS: KPI[] = [
  { id: 'kpi-1', nct_id: 'nct-1', title: 'Clientes Embaixadores', unit: 'clientes', target: 5, actual: 1, frequency: 'mensal' },
  { id: 'kpi-2', nct_id: 'nct-1', title: 'Ticket Médio Embaixador', unit: 'R$', target: 12500, actual: 10000, frequency: 'mensal' },
  { id: 'kpi-3', nct_id: 'nct-2', title: 'Posts/dia Yuki', unit: 'posts', target: 4, actual: 1.5, frequency: 'diario' },
  { id: 'kpi-4', nct_id: 'nct-3', title: 'Posts/dia Sócios', unit: 'posts', target: 2, actual: 0.5, frequency: 'diario' },
  { id: 'kpi-5', nct_id: 'nct-6', title: 'Ratio de Atendimento', unit: 'x', target: 10, actual: 0, frequency: 'mensal' },
]

export const COMMITMENTS: Commitment[] = [
  { id: 'c-1', nct_id: 'nct-1', title: 'Definir critérios do perfil embaixador', due_date: '2026-04-05', status: 'pendente', responsible_user_id: 'gustavo', week: 14 },
  { id: 'c-2', nct_id: 'nct-1', title: 'Prospectar 15 clientes potenciais', due_date: '2026-04-12', status: 'pendente', responsible_user_id: 'gustavo', week: 15 },
  { id: 'c-3', nct_id: 'nct-2', title: 'Criar calendário editorial Q2', due_date: '2026-04-05', status: 'pendente', responsible_user_id: 'gustavo', week: 14 },
  { id: 'c-4', nct_id: 'nct-2', title: 'Contratar social media júnior', due_date: '2026-04-10', status: 'pendente', responsible_user_id: 'gustavo', week: 15 },
  { id: 'c-5', nct_id: 'nct-4', title: 'Definir data e local do evento', due_date: '2026-04-08', status: 'pendente', responsible_user_id: 'victor', week: 14 },
  { id: 'c-6', nct_id: 'nct-5', title: 'Definir local e data do off-site', due_date: '2026-04-15', status: 'pendente', responsible_user_id: 'victor', week: 15 },
  { id: 'c-7', nct_id: 'nct-7', title: 'Mapear ferramentas de área de membros', due_date: '2026-04-05', status: 'pendente', responsible_user_id: 'nicolas', week: 14 },
]

export const BSC_ENTRIES: BSCEntry[] = [
  // Marketing
  { id: 'bsc-1', department_id: 'marketing', category: 'financeiro', indicator: 'CAC', target: 800, actual: 1100, unit: 'R$', period: '2026-03', traffic_light: 'vermelho' },
  { id: 'bsc-2', department_id: 'marketing', category: 'clientes', indicator: 'Leads Gerados', target: 500, actual: 380, unit: 'leads', period: '2026-03', traffic_light: 'amarelo' },
  { id: 'bsc-3', department_id: 'marketing', category: 'processos', indicator: 'Posts Publicados', target: 90, actual: 42, unit: 'posts', period: '2026-03', traffic_light: 'vermelho' },
  { id: 'bsc-4', department_id: 'marketing', category: 'aprendizado', indicator: 'A/B Tests Realizados', target: 4, actual: 2, unit: 'testes', period: '2026-03', traffic_light: 'amarelo' },
  // Comercial
  { id: 'bsc-5', department_id: 'comercial', category: 'financeiro', indicator: 'Receita Gerada', target: 500000, actual: 480000, unit: 'R$', period: '2026-03', traffic_light: 'amarelo' },
  { id: 'bsc-6', department_id: 'comercial', category: 'clientes', indicator: 'Taxa de Conversão', target: 25, actual: 22, unit: '%', period: '2026-03', traffic_light: 'amarelo' },
  { id: 'bsc-7', department_id: 'comercial', category: 'processos', indicator: 'Propostas Enviadas', target: 80, actual: 75, unit: 'propostas', period: '2026-03', traffic_light: 'verde' },
  { id: 'bsc-8', department_id: 'comercial', category: 'clientes', indicator: 'NPS', target: 70, actual: 68, unit: 'pontos', period: '2026-03', traffic_light: 'amarelo' },
  // Operacional
  { id: 'bsc-9', department_id: 'operacional', category: 'processos', indicator: 'Tempo Médio Onboarding', target: 5, actual: 7, unit: 'dias', period: '2026-03', traffic_light: 'vermelho' },
  { id: 'bsc-10', department_id: 'operacional', category: 'clientes', indicator: 'Satisfação Cliente', target: 90, actual: 85, unit: '%', period: '2026-03', traffic_light: 'amarelo' },
  { id: 'bsc-11', department_id: 'operacional', category: 'aprendizado', indicator: 'SOPs Documentados', target: 20, actual: 12, unit: 'docs', period: '2026-03', traffic_light: 'vermelho' },
  // Financeiro
  { id: 'bsc-12', department_id: 'financeiro', category: 'financeiro', indicator: 'MRR', target: 500000, actual: 500000, unit: 'R$', period: '2026-03', traffic_light: 'verde' },
  { id: 'bsc-13', department_id: 'financeiro', category: 'financeiro', indicator: 'Churn', target: 3, actual: 4.5, unit: '%', period: '2026-03', traffic_light: 'vermelho' },
  { id: 'bsc-14', department_id: 'financeiro', category: 'financeiro', indicator: 'LTV/CAC', target: 3, actual: 2.5, unit: 'x', period: '2026-03', traffic_light: 'amarelo' },
]

export const RITUALS: Ritual[] = [
  { id: 'r-1', name: 'Daily Liderança', frequency: 'diario', day_of_week: undefined, time: '08:30', department_id: undefined, responsible_user_id: 'victor', participants: ['victor', 'gustavo', 'erika', 'nicolas', 'antonio'], is_active: true },
  { id: 'r-2', name: 'Weekly Review — Marketing', frequency: 'semanal', day_of_week: 1, time: '09:00', department_id: 'marketing', responsible_user_id: 'gustavo', participants: ['gustavo', 'victor'], is_active: true },
  { id: 'r-3', name: 'Weekly Review — Comercial', frequency: 'semanal', day_of_week: 1, time: '10:00', department_id: 'comercial', responsible_user_id: 'antonio', participants: ['antonio', 'victor'], is_active: true },
  { id: 'r-4', name: 'Weekly Review — Operacional', frequency: 'semanal', day_of_week: 2, time: '09:00', department_id: 'operacional', responsible_user_id: 'nicolas', participants: ['nicolas', 'victor'], is_active: true },
  { id: 'r-5', name: 'Weekly Review — Financeiro', frequency: 'semanal', day_of_week: 3, time: '09:00', department_id: 'financeiro', responsible_user_id: 'erika', participants: ['erika', 'victor'], is_active: true },
  { id: 'r-6', name: 'Revisão de OKR Trimestral', frequency: 'trimestral', department_id: undefined, responsible_user_id: 'victor', participants: ['victor', 'gustavo', 'erika', 'nicolas', 'antonio'], is_active: true },
  { id: 'r-7', name: 'All Hands Mensal', frequency: 'mensal', department_id: undefined, responsible_user_id: 'victor', participants: ['victor', 'gustavo', 'erika', 'nicolas', 'antonio', 'gabriela'], is_active: true },
]

export const GOALS: Goal[] = [
  // Anual
  { id: 'g-1', title: 'MRR', type: 'anual', year: 2026, target: 2000000, actual: 500000, unit: 'R$/mês', traffic_light: 'vermelho' },
  { id: 'g-2', title: 'NPS Empresa', type: 'anual', year: 2026, target: 75, actual: 68, unit: 'pontos', traffic_light: 'amarelo' },
  { id: 'g-3', title: 'Churn', type: 'anual', year: 2026, target: 2, actual: 4.5, unit: '%', traffic_light: 'vermelho' },
  // Trimestral Q2
  { id: 'g-4', title: 'Clientes Embaixadores', type: 'trimestral', year: 2026, quarter: 'Q2', target: 5, actual: 1, unit: 'clientes', traffic_light: 'vermelho' },
  { id: 'g-5', title: 'Crescimento de MRR', type: 'trimestral', year: 2026, quarter: 'Q2', target: 20, actual: 0, unit: '%', traffic_light: 'cinza' },
  { id: 'g-6', title: 'Posts/dia (média)', type: 'trimestral', year: 2026, quarter: 'Q2', target: 4, actual: 0, unit: 'posts', traffic_light: 'cinza' },
]
