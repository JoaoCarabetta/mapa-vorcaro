# Mapa Vorcaro

Arquivo jornalístico em português do Brasil sobre **Daniel Bueno Vorcaro** (Banco Master / Operação Compliance Zero) e a interlocução com o poder. Cada evento cita fonte. O que não tem URL não entra.

Site: linha do tempo, ficha de evento, índice de pessoas, rede, busca, filtros, metodologia e exportação JSON/CSV.

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

**URL pública estável (produção):** [https://mapa-vorcaro.vercel.app](https://mapa-vorcaro.vercel.app)

O site é Next.js 15 (App Router), Node 20+ (`.nvmrc`), sem banco e sem variáveis obrigatórias. `vercel.json` no root fixa o framework, `npm ci`, `npm run build` e a região `gru1` (São Paulo). O build revalida o corpus; evento sem fonte derruba o deploy.

O domínio `mapa-vorcaro.vercel.app` fica no ar depois de **uma** ligação do repositório (hoje o hostname ainda responde 404 até essa ligação — o build local e o preview abaixo já passam).

### Ligar em dois minutos (checkpoint)

1. Abra o preview ao vivo: [https://temporary-sonic-redwood-xmobc12.vercel.app](https://temporary-sonic-redwood-xmobc12.vercel.app) (PT UI, 166 fichas).
2. **Claim** para não expirar: [claim desta deployment](https://vercel.com/claim-deployment?code=c095094c-a5fc-45bc-8931-3921d0281f31).
3. Ou importe o GitHub em [vercel.com/new](https://vercel.com/new): repositório `JoaoCarabetta/mapa-vorcaro`, projeto `mapa-vorcaro`, branch de produção `main`. Preview acompanha `cursor/mapa-vorcaro-completo-c83a` (PR #8).

CLI (depois do login / claim):

```bash
npx vercel link --yes --project mapa-vorcaro
npx vercel --prod --yes
```

## Ressalvas (também na UI)

- Mensagens de **visualização única**: a PF reconstitui o envio; a resposta do interlocutor em regra não está no extrato.
- **Rótulo de agenda** (“Alexandre de Moraes BRASILIA”) não é perícia de chip.
- O escritório **Barci de Moraes disputa o segundo contrato** (Viking / dação).
- A PF afirma que o relatório de 72 horas **não é exaustivo**. A PGR pediu nulidade da peça.

## Créditos

Projeto público, código neste repositório. Não fala pelo STF, PF, defesa de Vorcaro ou escritório Barci. Correção de fato: abra um PR no YAML.
