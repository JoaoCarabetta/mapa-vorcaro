export const metadata = { title: "Sobre" };

export default function SobrePage() {
  return (
    <div className="wrap prose">
      <header className="hero">
        <h1>Sobre / créditos</h1>
        <p className="lede">
          Mapa Vorcaro é um arquivo jornalístico em português do Brasil. Não é veículo
          institucional, não fala pelo Supremo, pela PF, pela defesa de Vorcaro nem pelo
          escritório Barci de Moraes.
        </p>
      </header>

      <h2>Propósito</h2>
      <p>
        Organizar, com citação, o que já é público sobre Daniel Bueno Vorcaro — a
        construção do Banco Master, a interlocução com autoridades e as peças da PET
        16.662 tornadas públicas em 1º de setembro de 2026. A hipótese de trabalho é
        simples: a cronologia sourced é mais útil do que o resumo viral.
      </p>

      <h2>Fontes centrais</h2>
      <ul>
        <li>Polícia Federal, IPJ-A 3298613/2026 (celular apreendido na Compliance Zero), via Poder360.</li>
        <li>Contratos e dação da PET 16.662 (Master–Barci, Viking–Barci).</li>
        <li>Despachos de André Mendonça e Edson Fachin.</li>
        <li>Poder360, Folha de S.Paulo, O Globo, Valor Econômico, g1, BBC News Brasil, Bloomberg Línea, Agência Brasil.</li>
      </ul>

      <h2>O que este site não faz</h2>
      <p>
        Não produz prova nova. Não transcreve números de telefone, endereços ou outros
        dados pessoais que o Poder360 tarjou. Não afirma que pedidos de Vorcaro foram
        atendidos — as fontes, até aqui, não demonstram isso.
      </p>

      <h2>Créditos e manutenção</h2>
      <p>
        Repositório <a href="https://github.com/JoaoCarabetta/mapa-vorcaro">JoaoCarabetta/mapa-vorcaro</a>.
        Correções de fato — data errada, citação truncada, fonte morta — devem entrar
        como correção no YAML, não como “versão”. O validador recusa evento sem URL.
      </p>
      <p>
        Interface e cópia em português do Brasil. Código aberto. Hospedagem prevista na
        Vercel.
      </p>
    </div>
  );
}
