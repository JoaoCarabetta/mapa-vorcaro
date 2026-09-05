import Link from "next/link";

export const metadata = { title: "Metodologia" };

export default function MetodologiaPage() {
  return (
    <div className="wrap prose">
      <header className="hero">
        <h1>Metodologia</h1>
        <p className="lede">
          Regras de sourcing, o que este arquivo não é, e as ressalvas que precisam
          acompanhar o material da PET 16.662.
        </p>
      </header>

      <h2>O que entra</h2>
      <p>
        Só entra evento com ao menos uma URL pública. O script <code>npm run validate</code>{" "}
        falha se faltar fonte, se a URL for inválida ou se faltar campo obrigatório
        (<code>id</code>, <code>date</code>, <code>date_precision</code>, <code>title</code>,{" "}
        <code>summary</code>, <code>people</code>, <code>tags</code>, <code>sources</code>,{" "}
        <code>evidence_type</code>).
      </p>
      <p>
        Preferimos documento primário (PDF da PF, contrato, despacho) a paráfrase de
        imprensa. Quando o primário existe, ele é linkado. A imprensa entra para
        cronologia de fatos oficiais (liquidação, fato relevante, prisão) e para o
        contraditório.
      </p>

      <h2>O que não entra</h2>
      <p>
        Não inventamos data, citação ou encontro. Trechos da vida de Vorcaro sem fonte
        pública — infância, vida privada sem registro — ficam de fora, em vez de ganhar
        uma ficha “bonita”. Rumores de rede social e peças sem URL estável não entram.
      </p>

      <h2>Campos</h2>
      <ul>
        <li><strong>date_precision</strong> — <code>day</code>, <code>month</code> ou <code>year</code> quando a fonte é vaga.</li>
        <li><strong>evidence_type</strong> — press, primary_document, court, official, other.</li>
        <li><strong>confidence</strong> — alta quando o documento é direto; média quando a imputação é de agenda, reenvio ou recado a terceiro; baixa quando a fonte é única e indireta.</li>
        <li><strong>quote</strong> — só texto que aparece na fonte, grafia original inclusive.</li>
        <li><strong>cluster_id / cluster_role</strong> — micro-cards forenses (Notas → WhatsApp, 28/out–17/nov/2025) entram no YAML um a um, mas na timeline aparecem sob o cartão-pai do dia.</li>
      </ul>

      <h2>Clusters forenses</h2>
      <p>
        O corpus sourced tem 152 fichas. Os carimbos de tempo da cadeia Apple Notas →
        screenshot → WhatsApp não são manchetes: a interface os agrupa em clusters
        diários expansíveis. Cada filho continua citável, com URL. Não inventamos teor
        de nota cujo OCR não está no material.
      </p>

      <h2>Ressalvas que não podem sumir</h2>
      <h3>1. Visualização única</h3>
      <p>
        Vorcaro escrevia no app Notas, tirava print e enviava no WhatsApp como imagem de
        visualização única. A PF reconstrói o envio por logs, screenshot e PDF temporário
        do iOS. Em regra, a resposta do interlocutor não está no extrato. “Vorcaro perguntou”
        não implica “Moraes respondeu X”.
      </p>
      <h3>2. Rótulo de agenda ≠ perícia de chip</h3>
      <p>
        O número foi compartilhado por Fábio Faria e salvo como “Alexandre de Moraes
        BRASILIA” (e aliases “Novo”, “STF TSE NOVO”, “Eu STF”). Isso é evidência de como
        Vorcaro rotulou o contato. Não substitui perícia de titularidade da linha. O
        gabinete de Moraes, em março de 2026, chamou associações anteriores de “ilação
        mentirosa”. As duas coisas ficam no arquivo.
      </p>
      <h3>3. Segundo contrato Barci</h3>
      <p>
        A PF anexa contrato Viking–Barci (12 maio 2025) e termo de dação com cotas de
        aeronaves (19 maio 2025). O escritório diz que só assinou o contrato Master de
        2024, que a proposta não foi aceita e que “nada foi assinado”. Mensagens internas
        de Vorcaro falam em uso das cotas; isso não resolve a disputa jurídica sobre o
        instrumento.
      </p>
      <h3>4. Relatório de 72 horas</h3>
      <p>
        A própria PF escreve que a análise “não possui caráter exaustivo”. A PGR pediu a
        nulidade da peça. Este site não arbitra competência do relator; registra o
        documento e o contraditório.
      </p>
      <h3>5. Encontros</h3>
      <p>
        Vários “encontros” são reconstruídos a partir de Vorcaro avisando filha, namorada
        ou motorista. Contagem da imprensa oscila (“ao menos seis”, “nove”). Marcamos
        confiança média nesses casos.
      </p>

      <h2>Como adicionar um evento</h2>
      <p>
        Crie um item YAML em <code>data/events/</code>. Rode <code>npm run validate</code>.
        Instruções completas estão no <Link href="https://github.com/JoaoCarabetta/mapa-vorcaro">README</Link>.
      </p>
    </div>
  );
}
