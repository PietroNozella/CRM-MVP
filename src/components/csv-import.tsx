'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LEAD_STATUSES } from '@/lib/pipeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Campos importaveis: [coluna do banco, rotulo, obrigatorio]
const FIELDS = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'whatsapp', label: 'WhatsApp', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'status', label: 'Status', required: false },
  { key: 'interesse', label: 'Interesse', required: false },
  { key: 'valor_maximo', label: 'Valor', required: false },
  { key: 'source', label: 'Origem', required: false },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

// Palpites de mapeamento pelo nome do cabecalho (minusculo, sem acento)
const HEADER_GUESS: Record<string, FieldKey> = {
  nome: 'nome',
  name: 'nome',
  cliente: 'nome',
  whatsapp: 'whatsapp',
  telefone: 'whatsapp',
  fone: 'whatsapp',
  phone: 'whatsapp',
  celular: 'whatsapp',
  email: 'email',
  'e-mail': 'email',
  status: 'status',
  situacao: 'status',
  interesse: 'interesse',
  servico: 'interesse',
  produto: 'interesse',
  valor: 'valor_maximo',
  valor_maximo: 'valor_maximo',
  preco: 'valor_maximo',
  origem: 'source',
  source: 'source',
  canal: 'source',
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Parser CSV minimo: detecta ; ou ,, respeita aspas duplas
function parseCSV(text: string): string[][] {
  const firstLine = text.split(/\r?\n/)[0] ?? ''
  const semis = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  const delim = semis >= commas ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const clean = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      row.push(field.trim())
      field = ''
    } else if (c === '\n') {
      row.push(field.trim())
      field = ''
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
    } else if (c === '\r') {
      // ignora, tratado no \n
    } else {
      field += c
    }
  }
  row.push(field.trim())
  if (row.some((v) => v !== '')) rows.push(row)
  return rows
}

function normStatus(raw: string): string {
  // "Em Atendimento" -> em_atendimento ; "visita"(legado) -> em_negociacao
  const v = norm(raw).replace(/\s+/g, '_')
  if (v === 'visita') return 'em_negociacao'
  return VALID_STATUS.has(v as never) ? v : 'novo'
}

function parseValor(raw: string): number | null {
  if (!raw) return null
  // pt-BR: "1.234,56" -> 1234.56 ; "1.234" (milhar) -> 1234 ; "99.9" -> 99.9
  let v = raw.replace(/[R$\s]/g, '')
  if (v.includes(',')) {
    v = v.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(v)) {
    v = v.replace(/\./g, '')
  }
  const n = Number(v)
  return v !== '' && !Number.isNaN(n) && n > 0 ? n : null
}

const VALID_STATUS = new Set(LEAD_STATUSES.map((s) => s.value))

export function CsvImport() {
  const router = useRouter()
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<number, string>>({})
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onFile(file: File) {
    setError(null)
    setResult(null)
    const text = await file.text()
    const parsed = parseCSV(text)
    if (parsed.length < 2) {
      setError('CSV vazio ou sem linhas de dados.')
      return
    }
    const [head, ...data] = parsed
    setHeaders(head)
    setRows(data)
    setFileName(file.name)
    const guess: Record<number, string> = {}
    head.forEach((h, i) => {
      const g = HEADER_GUESS[norm(h)]
      if (g) guess[i] = g
    })
    setMapping(guess)
  }

  const mappedKeys = useMemo(() => Object.values(mapping), [mapping])
  const validCount = useMemo(() => {
    const nameIdx: number[] = []
    const phoneIdx: number[] = []
    Object.entries(mapping).forEach(([col, field]) => {
      if (field === 'nome') nameIdx.push(Number(col))
      if (field === 'whatsapp') phoneIdx.push(Number(col))
    })
    if (!nameIdx.length || !phoneIdx.length) return 0
    return rows.filter((r) =>
      nameIdx.some((i) => r[i]?.trim()) && phoneIdx.some((i) => r[i]?.trim())
    ).length
  }, [rows, mapping])
  const canImport =
    rows.length > 0 &&
    mappedKeys.includes('nome') &&
    mappedKeys.includes('whatsapp')

  async function onImport() {
    setImporting(true)
    setError(null)
    setResult(null)
    try {
      const colToField = mapping
      const payload: Record<string, unknown>[] = []
      let skipped = 0
      for (const r of rows) {
        const rec: Record<string, string> = {}
        r.forEach((val, i) => {
          const f = colToField[i]
          if (f && f !== 'ignore') rec[f] = val
        })
        if (!rec.nome?.trim() || !rec.whatsapp?.trim()) {
          skipped++
          continue
        }
        const status = normStatus(rec.status ?? '')
        payload.push({
          nome: rec.nome.trim(),
          whatsapp: rec.whatsapp.trim(),
          email: rec.email?.trim() || null,
          status,
          interesse: rec.interesse?.trim() || null,
          valor_maximo: rec.valor_maximo ? parseValor(rec.valor_maximo) : null,
          source: rec.source?.trim() || 'csv',
        })
      }
      if (payload.length === 0) {
        setError('Nenhuma linha válida (nome + WhatsApp obrigatórios).')
        return
      }
      const supabase = createClient()
      let inserted = 0
      for (let i = 0; i < payload.length; i += 100) {
        const batch = payload.slice(i, i + 100)
        const { error } = await supabase.from('leads').insert(batch)
        if (error) throw error
        inserted += batch.length
      }
      setResult(
        `${inserted} contato(s) importado(s)${skipped ? `, ${skipped} linha(s) ignorada(s) sem nome/WhatsApp` : ''}.`
      )
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na importação.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-lg border border-t-2 border-t-accent bg-card p-5 md:p-6">
        <p className="section-index">01 / ARQUIVO</p>
        <label className="mb-3 mt-2 block text-lg font-semibold">Arquivo CSV</label>
        <Input
          type="file"
          accept=".csv,text/csv"
          disabled={importing}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Exportado do Excel/Planilhas (aceita `;` ou `,`). Nome + WhatsApp obrigatórios.
        </p>
      </div>

      {headers.length > 0 && (
        <>
          <div className="space-y-3 rounded-lg border bg-card p-5 md:p-6">
            <p className="section-index">02 / MAPEAMENTO</p>
            <h2 className="text-base font-semibold">
              Combine as colunas da planilha — {fileName} ({rows.length} linhas)
            </h2>
            {headers.map((h, i) => (
              <div key={i} className="grid gap-2 border-t pt-3 sm:grid-cols-[minmax(10rem,1fr)_13rem] sm:items-center">
                <label htmlFor={`coluna-${i}`} className="break-words font-mono text-xs">{h}</label>
                <Select
                  value={mapping[i] ?? 'ignore'}
                  onValueChange={(v) =>
                    setMapping((m) => ({ ...m, [i]: v }))
                  }
                >
                  <SelectTrigger id={`coluna-${i}`} className="min-h-11 w-full sm:w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">Ignorar</SelectItem>
                    {FIELDS.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                        {f.required ? ' *' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border bg-card p-1">
            <h2 className="px-4 py-4 text-base font-semibold">Prévia <span className="font-mono text-xs font-normal text-muted-foreground">/ 5 PRIMEIRAS LINHAS</span></h2>
            <Table className="border-t">
              <TableHeader>
                <TableRow>
                  {headers.map((h, i) => (
                    <TableHead key={i}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 5).map((r, i) => (
                  <TableRow key={i}>
                    {headers.map((_, j) => (
                      <TableCell key={j} className="max-w-48 truncate">
                        {r[j] ?? ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {result && <p role="status" className="text-sm text-green-700">{result}</p>}
          <Button onClick={onImport} disabled={!canImport || importing} className="min-h-11">
            {importing
              ? `Importando...`
              : `Importar ${validCount} contato${validCount === 1 ? '' : 's'}`}
          </Button>
          {!canImport && (
            <p className="text-xs text-muted-foreground">
              Mapeie ao menos Nome e WhatsApp para importar.
            </p>
          )}
        </>
      )}

      {headers.length === 0 && (
        <>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  )
}
