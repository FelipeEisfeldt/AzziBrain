import React from 'react';
import { RefreshCw, Sparkles, ArrowUpRight } from 'lucide-react';
import type { GeneratedIdea } from '../../types/innovations';

interface Props {
  idea: GeneratedIdea;
  index: number;
  regenerando: boolean;
  onRegenerar: (index: number) => void;
  onAbrir: (idea: GeneratedIdea) => void;
}

/**
 * Cada categoria ganha uma cor da paleta do site. Sao as mesmas cinco cores que
 * a Azzi usa nas ilustracoes: limao, rosa, blush, vinho e o proprio preto.
 */
const COR_POR_CATEGORIA: Record<string, string> = {
  'Reconhecimento Facial & IA': 'bg-lime',
  'Surveys & Engajamento 90%+': 'bg-pink',
  'Dashboards & ROI de Marcas': 'bg-blush',
  'Sentimento & Análise Emocional': 'bg-rose',
  'Ética, LGPD & Privacidade': 'bg-ink',
  'WhatsApp & Entrega Omnichannel': 'bg-lime',
  'Ativações em Tempo Real & Live': 'bg-pink',
  'CRM Pós-Evento & Monetização': 'bg-blush',
};

export const IdeaCard: React.FC<Props> = ({
  idea,
  index,
  regenerando,
  onRegenerar,
  onAbrir,
}) => {
  const cor = COR_POR_CATEGORIA[idea.category] ?? 'bg-ink';

  return (
    <article
      className={[
        'group relative flex flex-col rounded-2xl border border-ink/12 bg-white p-6 transition-all',
        'hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_12px_32px_-18px_rgba(35,35,35,0.5)]',
        regenerando ? 'opacity-55' : '',
      ].join(' ')}
    >
      {/* Fita de cor da categoria */}
      <span className={`absolute left-6 top-0 h-1 w-12 rounded-b-full ${cor}`} />

      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="azzi-step-number text-ink/35">
            {String(idea.number).padStart(2, '0')}
          </span>
          {idea.aiPowered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">
              <Sparkles className="h-2.5 w-2.5" /> IA
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRegenerar(index)}
          disabled={regenerando}
          title="Gerar outra ideia neste card"
          className="rounded-full p-1.5 text-ink/35 opacity-0 transition hover:bg-ink/5 hover:text-ink focus:opacity-100 group-hover:opacity-100 disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${regenerando ? 'animate-spin opacity-100' : ''}`} />
        </button>
      </header>

      <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">{idea.title}</h3>
      <p className="mt-2 font-body text-sm leading-relaxed text-ink/60">{idea.subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] text-ink/65">
          {idea.category}
        </span>
        <span className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] text-ink/65">
          {idea.difficultyLevel}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <p className="font-display text-sm italic leading-snug text-ink/75">{idea.impactMetric}</p>
        <button
          type="button"
          onClick={() => onAbrir(idea)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-paper transition hover:bg-ink-soft active:scale-95"
        >
          Abrir <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
};
