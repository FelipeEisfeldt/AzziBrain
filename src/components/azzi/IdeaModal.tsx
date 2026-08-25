import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Wand2, Server } from 'lucide-react';
import type { GeneratedIdea } from '../../types/innovations';

interface Props {
  idea: GeneratedIdea | null;
  onFechar: () => void;
}

/**
 * Detalhe da ideia: problema, inovacao, arquitetura, rotas e o system prompt.
 * O botao "Aprofundar com IA" chama /api/v1/generator/deep-prompt, que roda no
 * provedor detectado (Claude ou Gemini) e devolve um prompt bem mais completo
 * que o embutido no card.
 */
export const IdeaModal: React.FC<Props> = ({ idea, onFechar }) => {
  const [prompt, setPrompt] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [origem, setOrigem] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(idea?.systemPrompt ?? '');
    setOrigem(null);
    setCopiado(false);
  }, [idea]);

  // Fechar com Esc é o comportamento esperado de qualquer modal.
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onFechar]);

  if (!idea) return null;

  const aprofundar = async () => {
    setCarregando(true);
    try {
      const r = await fetch('/api/v1/generator/deep-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          category: idea.category,
          problem: idea.theProblem,
          innovation: idea.theInnovation,
          impact: idea.impactMetric,
          systemPrompt: idea.systemPrompt,
        }),
      });
      const d = await r.json();
      if (d.prompt) setPrompt(d.prompt);
      setOrigem(d.isFallback ? 'determinístico (sem IA)' : d.provider || 'IA');
    } catch {
      setOrigem('falha na chamada');
    } finally {
      setCarregando(false);
    }
  };

  const copiar = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onFechar}
    >
      <div
        className="azzi-scroll max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink/10 bg-paper/95 px-7 py-5 backdrop-blur">
          <div>
            <span className="azzi-step-number text-ink/40">
              {String(idea.number).padStart(2, '0')}
            </span>
            <h2 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight text-ink">
              {idea.title}
            </h2>
            <p className="mt-1 font-body text-sm text-ink/55">{idea.category}</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-8 px-7 py-7">
          <Bloco titulo="O problema">{idea.theProblem}</Bloco>
          <Bloco titulo="A inovação">{idea.theInnovation}</Bloco>

          <div>
            <TituloBloco>Arquitetura</TituloBloco>
            <div className="grid gap-4 sm:grid-cols-2">
              <Lista rotulo="Módulos" itens={idea.theArchitecture.coreModules} />
              <Lista rotulo="Stack" itens={idea.theArchitecture.techStack} />
              <Lista rotulo="Protocolos" itens={idea.theArchitecture.protocols} />
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                  Estimativa
                </p>
                <p className="font-display text-2xl text-ink">
                  {idea.theArchitecture.estimatedTimeDays}{' '}
                  <span className="text-base italic">dias</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <TituloBloco>Rotas de API</TituloBloco>
            <ul className="divide-y divide-ink/10 overflow-hidden rounded-xl border border-ink/12 bg-white">
              {idea.apiEndpoints.map((e, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-paper">
                    {e.method}
                  </span>
                  <div className="min-w-0">
                    <code className="block break-all font-mono text-xs text-ink">{e.path}</code>
                    <p className="mt-0.5 font-body text-xs text-ink/55">{e.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <TituloBloco semMargem>System prompt</TituloBloco>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={aprofundar}
                  disabled={carregando}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-paper disabled:opacity-50"
                >
                  <Wand2 className={`h-3.5 w-3.5 ${carregando ? 'animate-pulse' : ''}`} />
                  {carregando ? 'Gerando…' : 'Aprofundar com IA'}
                </button>
                <button
                  type="button"
                  onClick={copiar}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-ink-soft"
                >
                  {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {origem && (
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-ink/50">
                <Server className="h-3 w-3" /> origem: {origem}
              </p>
            )}

            <pre className="azzi-scroll max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-ink/12 bg-white p-5 font-mono text-[11.5px] leading-relaxed text-ink/85">
              {prompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const TituloBloco: React.FC<{ children: React.ReactNode; semMargem?: boolean }> = ({
  children,
  semMargem,
}) => (
  <p
    className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40 ${
      semMargem ? '' : 'mb-3'
    }`}
  >
    {children}
  </p>
);

const Bloco: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <div>
    <TituloBloco>{titulo}</TituloBloco>
    <p className="font-body text-[15px] leading-relaxed text-ink/75">{children}</p>
  </div>
);

const Lista: React.FC<{ rotulo: string; itens: string[] }> = ({ rotulo, itens }) => (
  <div>
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink/40">{rotulo}</p>
    <ul className="flex flex-wrap gap-1.5">
      {itens.map((i) => (
        <li
          key={i}
          className="rounded-full border border-ink/15 bg-white px-2.5 py-1 text-[11px] text-ink/70"
        >
          {i}
        </li>
      ))}
    </ul>
  </div>
);
