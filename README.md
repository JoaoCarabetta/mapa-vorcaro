# Mapa Vorcaro

Arquivo jornalístico em português do Brasil sobre **Daniel Bueno Vorcaro** (Banco Master / Operação Compliance Zero) e a interlocução com o poder. Cada evento cita fonte. O que não tem URL não entra.

Site: timeline, ficha de evento, índice de pessoas, rede, busca, filtros, metodologia e exportação JSON/CSV.

## Princípio

Acurácia acima de verniz. Preferimos o feio documentado ao bonito inventado. Citações e datas saem das fontes públicas (PDFs da PET 16.662, imprensa). Não fabricamos encontro, recado ou número.

## Rodar localmente

```bash
npm install
npm run validate   # falha se algum evento estiver sem fonte/URL
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build      # valida de novo e gera o site (Vercel usa este comando)
npm start
```

Requisitos: Node 20+.

## Adicionar um evento

1. Crie (ou edite) um YAML em `data/events/`. Cada arquivo é uma **lista** de eventos.
2. Campos obrigatórios:

| campo | regra |
| --- | --- |
| `id` | slug único, em kebab-case |
| `date` | ISO (`YYYY-MM-DD`; use dia 01 se a precisão for mês/ano) |
| `date_precision` | `day` \| `month` \| `year` |
| `title` | título jornalístico, sem hype |
| `summary` | 2–6 frases |
| `people` | lista de `{ name, role?, id? }` |
| `tags` | ex. `contrato`, `whatsapp`, `stf`, `pf`, `brb`, `liquidacao`, `prisao` |
| `sources` | **pelo menos uma URL** (`url`, `publisher`, `title?`, `accessed?`, `quote?`) |
| `evidence_type` | `press` \| `primary_document` \| `court` \| `official` \| `other` |
| `confidence` | opcional: `high` \| `medium` \| `low` |
| `notes` | opcional; use para ressalvas |

3. Se a pessoa for recorrente, acrescente-a em `data/people.yml` e use o mesmo `id`.
4. Rode `npm run validate`. Se faltar fonte, o script **sai com erro**.

Modelo mínimo:

```yaml
- id: exemplo-com-fonte
  date: "2026-09-01"
  date_precision: day
  title: Título factual
  summary: >
    Dois a seis períodos, tom de nota, sem adjetivo de processo.
  people:
    - { name: Daniel Bueno Vorcaro, id: daniel-bueno-vorcaro }
  tags: [stf]
  sources:
    - url: https://exemplo.org/peca
      publisher: Nome do veículo ou órgão
      title: Título da peça
      accessed: "2026-09-05"
  evidence_type: press
  confidence: medium
```

## Estrutura

```
data/events/     # corpus (YAML)
data/people.yml  # fichas de pessoas
data/edges.yml   # arestas da rede
scripts/validate.mjs
app/             # Next.js App Router
```

## Deploy (Vercel)

1. Importe o repositório `JoaoCarabetta/mapa-vorcaro`.
2. Framework: Next.js (detectado). Comando de build: `npm run build`.
3. Sem banco. Sem variáveis obrigatórias.
4. `vercel.json` está no root.

O build revalida o corpus. Evento sem fonte derruba o deploy.

## Ressalvas (também na UI)

- Mensagens de **visualização única**: a PF reconstitui o envio; a resposta do interlocutor em regra não está no extrato.
- **Rótulo de agenda** (“Alexandre de Moraes BRASILIA”) não é perícia de chip.
- O escritório **Barci de Moraes disputa o segundo contrato** (Viking / dação).
- A PF afirma que o relatório de 72 horas **não é exaustivo**. A PGR pediu nulidade da peça.

## Créditos

Projeto público, código neste repositório. Não fala pelo STF, PF, defesa de Vorcaro ou escritório Barci. Correção de fato: abra um PR no YAML.
