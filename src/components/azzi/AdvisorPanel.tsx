import React, { useState } from 'react';
import { Send, Loader2, TriangleAlert, Download } from 'lucide-react';

const SUGESTOES = [
  'Como elevar a taxa de resposta do micro-survey acima de 90% sem irritar o público?',
  'Que métricas provam ROI de patrocínio para uma marca no Cais Embarcadeiro?',
  'Como estruturar o consentimento LGPD de vetores faciais em evento aberto?',
];

/**
 * Consultor estrategico: fala com /api/v1/ai/deep-analysis, que por sua vez roda
 * no provedor detectado. Quando nao ha IA na maquina, o endpoint responde com a
 * analise deterministica e marca isSimulated — sinalizado aqui para o usuario.
 */
export const AdvisorPanel: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [simulado, setSimulado] = useState(false);
  const [provedor, setProvedor] = useState<string | null>(null);

  const enviar = async (texto?: string) => {
    const q = (texto ?? pergunta).trim();
    if (!q || carregando) return;
    setPergunta(q);
    setCarregando(true);
    setResposta('');
    try {
      const r = await fetch('/api/v1/ai/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, contextDomain: 'Inteligência de Eventos Azzi' }),
      });
      const d = await r.json();
      setResposta(d.content || 'Sem resposta.');
      setSimulado(Boolean(d.isSimulated));
      setProvedor(d.provider ?? null);
    } catch (e: any) {
      setResposta(`Falha ao consultar a API: ${e?.message ?? e}`);
      setSimulado(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink/12 bg-white p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Pergunte sobre engajamento, ROI de patrocínio, LGPD…"
          className="min-w-0 flex-1 rounded-full border border-ink/15 bg-paper px-5 py-3 font-body text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ink/45"
        />
        <button
          type="button"
          onClick={() => enviar()}
          disabled={carregando || !pergunta.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
        >
          {carregando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {carregando ? 'Analisando…' : 'Analisar'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGESTOES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => enviar(s)}
            disabled={carregando}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-left text-[11px] text-ink/60 transition hover:border-ink/40 hover:text-ink disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {resposta && (
        <div className="mt-7 border-t border-ink/10 pt-6">
          {(simulado || provedor) && (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-[11px] text-ink/55">
              <span
                className={`h-1.5 w-1.5 rounded-full ${simulado ? 'bg-rose' : 'bg-lime-deep'}`}
              />
              {simulado
                ? 'resposta determinística — nenhuma IA vinculada nesta máquina'
                : `gerado por ${provedor}`}
            </p>
          )}

          {/* Sem IA, o texto abaixo e sempre o mesmo e NAO considera a pergunta.
              Dizer isso na cara evita que o usuario leia como se fosse resposta. */}
          {simulado && (
            <div className="mb-5 rounded-xl border border-ink/15 bg-lime/25 px-5 py-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-ink">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Sua pergunta não foi lida
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink/70">
                Não há inteligência artificial vinculada nesta máquina, então o texto
                abaixo é um exemplo fixo do sistema — ele é sempre o mesmo, qualquer que
                seja a pergunta. Para receber respostas de verdade, conecte o Claude ou o
                Gemini.
              </p>
              <a
                href="/COMO-CONECTAR-IA.docx"
                download
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink-soft active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" />
                Como conectar (guia em Word)
              </a>
            </div>
          )}

          <div
            className={`azzi-scroll max-h-[26rem] overflow-y-auto whitespace-pre-wrap font-body text-[15px] leading-relaxed ${
              simulado ? 'text-ink/45' : 'text-ink/80'
            }`}
          >
            {resposta}
          </div>
        </div>
      )}
    </div>
  );
};
