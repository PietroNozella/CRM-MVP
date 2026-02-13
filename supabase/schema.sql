-- Tabela leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'visita', 'fechado')),
  interesse TEXT,
  valor_maximo NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela imoveis
CREATE TABLE imoveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  preco NUMERIC NOT NULL,
  bairro TEXT NOT NULL,
  quartos INTEGER NOT NULL DEFAULT 0,
  banheiros INTEGER NOT NULL DEFAULT 0,
  vagas INTEGER NOT NULL DEFAULT 0,
  area NUMERIC NOT NULL DEFAULT 0,
  fotos_url TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (opcional para MVP)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for imoveis" ON imoveis FOR ALL USING (true) WITH CHECK (true);
