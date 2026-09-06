-- Instalacao do zero: rode este arquivo inteiro no SQL Editor do Supabase
-- do cliente (projeto novo). Bancos existentes: rode apenas os arquivos
-- em supabase/migrations/ na ordem de data.
--
-- Modelo: 1 banco por cliente (single-tenant). Sem multi-tenant.

-- Tabela leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_atendimento', 'em_negociacao', 'fechado')),
  interesse TEXT,
  valor_maximo NUMERIC,
  source TEXT,
  proximo_retorno DATE,
  nota_retorno TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela imoveis (legado do nicho imobiliario, fora do menu; manter para
-- nao quebrar bancos existentes, remover quando nenhum cliente usar)
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

-- RLS: instalacao single-tenant (1 empresa por banco). Policies abertas para
-- o app funcionar sem login. Se o cliente pedir login depois, troque por
-- policies com auth.uid() — ver Supabase Auth docs.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for imoveis" ON imoveis FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS leads_proximo_retorno_idx ON leads (proximo_retorno);
