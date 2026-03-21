-- ============================================================
-- YUKI MIND SYSTEM — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- Departments
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planejado', -- ativo | planejado
  head_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NCTs
CREATE TABLE ncts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department_id TEXT REFERENCES departments(id),
  dri_user_id UUID REFERENCES auth.users(id),
  quarter TEXT NOT NULL, -- Q1|Q2|Q3|Q4
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'nao_iniciado',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_id UUID REFERENCES ncts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  unit TEXT NOT NULL,
  target NUMERIC NOT NULL,
  actual NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'mensal', -- diario|semanal|mensal
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commitments (Entregas)
CREATE TABLE commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nct_id UUID REFERENCES ncts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente|concluido|atrasado
  responsible_user_id UUID REFERENCES auth.users(id),
  week INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BSC Entries
CREATE TABLE bsc_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id TEXT REFERENCES departments(id),
  category TEXT NOT NULL, -- financeiro|clientes|processos|aprendizado
  indicator TEXT NOT NULL,
  target NUMERIC NOT NULL,
  actual NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  period TEXT NOT NULL, -- YYYY-MM
  traffic_light TEXT NOT NULL DEFAULT 'cinza', -- verde|amarelo|vermelho|cinza
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- anual|trimestral|mensal
  year INTEGER NOT NULL,
  quarter TEXT, -- Q1|Q2|Q3|Q4
  month INTEGER,
  department_id TEXT REFERENCES departments(id),
  target NUMERIC NOT NULL,
  actual NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  traffic_light TEXT NOT NULL DEFAULT 'cinza',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rituals
CREATE TABLE rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- diario|semanal|quinzenal|mensal|trimestral
  day_of_week INTEGER, -- 0=Dom, 6=Sab
  time TEXT,
  department_id TEXT REFERENCES departments(id),
  responsible_user_id UUID REFERENCES auth.users(id),
  participants UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'auxiliar',
  department_id TEXT REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'auxiliar');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bsc_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Leitura para autenticados" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON ncts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON commitments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON bsc_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON rituals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura para autenticados" ON profiles FOR SELECT TO authenticated USING (true);

-- All authenticated users can insert/update (expand with roles later)
CREATE POLICY "Escrita para autenticados" ON ncts FOR ALL TO authenticated USING (true);
CREATE POLICY "Escrita para autenticados" ON kpis FOR ALL TO authenticated USING (true);
CREATE POLICY "Escrita para autenticados" ON commitments FOR ALL TO authenticated USING (true);
CREATE POLICY "Escrita para autenticados" ON bsc_entries FOR ALL TO authenticated USING (true);
CREATE POLICY "Escrita para autenticados" ON goals FOR ALL TO authenticated USING (true);
CREATE POLICY "Escrita para autenticados" ON rituals FOR ALL TO authenticated USING (true);
