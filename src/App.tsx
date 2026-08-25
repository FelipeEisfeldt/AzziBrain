import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, TriangleAlert, Copy, Check, Download } from 'lucide-react';
import type { GeneratedIdea } from './types/innovations';
import {
  AzziNav,
  AzziHero,
  BrandMarquee,
  SectionHead,
  AzziFooter,
} from './components/azzi/AzziChrome';
import type { AiStatus } from './components/azzi/AiStatusBadge';
import { IdeaCard } from './components/azzi/IdeaCard';
import { IdeaModal } from './components/azzi/IdeaModal';
import { AdvisorPanel } from './components/azzi/AdvisorPanel';

/** Rotas expostas pelo servidor, listadas na secao "API" da pagina. */
const ROTAS = [
  { m: 'GET', p: '/api/v1/ai/status', d: 'Qual IA está vinculada nesta máquina' },
  { m: 'GET', p: '/api/v1/generator/ideas', d: 'Os 20 cards ativos do grid' },
  { m: 'POST', p: '/api/v1/generator/regenerate-card', d: 'Gera nova ideia num card específico' },
  { m: 'POST', p: '/api/v1/generator/regenerate-all', d: 'Regenera o grid inteiro' },
  { m: 'POST', p: '/api/v1/generator/deep-prompt', d: 'System prompt completo da ideia' },
  { m: 'POST', p: '/api/v1/ai/deep-analysis', d: 'Consultor estratégico Azzi' },
  { m: 'GET', p: '/api/v1/esg/passports', d: 'Surveys e análise de sentimento' },
  { m: 'GET', p: '/api/v1/copacking/current-plate', d: 'Ativação de evento e patrocinadores' },
];

export default function App() {
  const [ideias, setIdeias] = useState<GeneratedIdea[]>([]);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [checandoStatus, setChecandoStatus] = useState(false);
  const [regenerando, setRegenerando] = useState<number | null>(null);
  const [regenerandoTudo, setRegenerandoTudo] = useState(false);
  const [aberta, setAberta] = useState<GeneratedIdea | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregarStatus = useCallback(async (refresh = false) => {
    setChecandoStatus(true);
    try {
      const r = await fetch(`/api/v1/ai/status${refresh ? '?refresh=1' : ''}`);
      setStatus(await r.json());
    } catch {
      setStatus({
        provider: 'desconhecido',
        label: 'Servidor fora do ar',
        detail: 'Não foi possível falar com o servidor local.',
        live: false,
      });
    } finally {
      setChecandoStatus(false);
    }
  }, []);

  const carregarIdeias = useCallback(async () => {
    try {
      const r = await fetch('/api/v1/generator/ideas');
      const d = await r.json();
      if (d.ideas) setIdeias(d.ideas);
      setErro(null);
    } catch (e: any) {
      setErro(`Não foi possível carregar as ideias: ${e?.message ?? e}`);
    }
  }, []);

  useEffect(() => {
    carregarStatus();
    carregarIdeias();
  }, [carregarStatus, carregarIdeias]);

  // Manda os titulos ja usados para o servidor nao repetir ideia.
  const titulos = useMemo(() => ideias.map((i) => i.title), [ideias]);

  const regenerarCard = async (index: number) => {
    setRegenerando(index);
    try {
      const r = await fetch('/api/v1/generator/regenerate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIndex: index, excludedTitles: titulos }),
      });
      const d = await r.json();
      if (d.success && d.idea) {
        setIdeias((prev) => {
          const copia = [...prev];
          copia[index] = d.idea;
          return copia;
        });
      }
    } catch (e: any) {
      setErro(`Falha ao regenerar o card: ${e?.message ?? e}`);
    } finally {
      setRegenerando(null);
    }
  };

  const regenerarTudo = async () => {
    setRegenerandoTudo(true);
    try {
      const r = await fetch('/api/v1/generator/regenerate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludedTitles: titulos }),
      });
      const d = await r.json();
      if (d.ideas) setIdeias(d.ideas);
    } catch (e: any) {
      setErro(`Falha ao regenerar o grid: ${e?.message ?? e}`);
    } finally {
      setRegenerandoTudo(false);
    }
  };

  const comIa = ideias.filter((i) => i.aiPowered).length;

  return (
    <div className="min-h-screen bg-paper">
      <AzziNav
        status={status}
        onRefreshStatus={() => carregarStatus(true)}
        refreshing={checandoStatus}
        onPrimaryAction={regenerarTudo}
        primaryBusy={regenerandoTudo}
      />

      <AzziHero total={ideias.length} comIa={comIa} />
      <BrandMarquee />

      {status && !status.live && <AvisoSemIa detalhe={status.detail} />}
      {erro && (
        <div className="mx-auto mt-6 max-w-7xl px-5 lg:px-8">
          <p className="rounded-xl border border-rose/30 bg-rose/10 px-5 py-3 text-sm text-rose">
            {erro}
          </p>
        </div>
      )}

      {/* 01 — Grid de ideias */}
      <section id="ideias" className="mx-auto max-w-7xl px-5 pt-20 lg:px-8">
        <SectionHead
          numero="01"
          titulo={
            <>
              Ideias que seu evento
              <br />
              <span className="azzi-serif-accent">ainda não teve</span>
            </>
          }
          descricao="Cada card é uma proposta completa: o problema real, a inovação, a arquitetura de módulos, as rotas de API e o prompt pronto para implementar."
          acao={
            <button
              type="button"
              onClick={regenerarTudo}
              disabled={regenerandoTudo}
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${regenerandoTudo ? 'animate-spin' : ''}`} />
              {regenerandoTudo ? 'Regenerando…' : 'Regenerar grid'}
            </button>
          }
        />

        {ideias.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-ink/10 bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ideias.map((idea, i) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                index={i}
                regenerando={regenerando === i}
                onRegenerar={regenerarCard}
                onAbrir={setAberta}
              />
            ))}
          </div>
        )}
      </section>

      {/* 02 — Consultor */}
      <section id="consultor" className="mx-auto max-w-7xl px-5 pt-24 lg:px-8">
        <SectionHead
          numero="02"
          titulo={
            <>
              Nossa IA traduz
              <br />
              <span className="azzi-serif-accent">fotografias em dados</span>
            </>
          }
          descricao="Pergunte como um diretor de tecnologia da Azzi responderia: engajamento, ROI de patrocinador, conformidade com a LGPD e monetização em evento."
        />
        <AdvisorPanel />
      </section>

      {/* 03 — API */}
      <section id="api" className="mx-auto max-w-7xl px-5 pt-24 lg:px-8">
        <SectionHead
          numero="03"
          titulo={
            <>
              A mesma inteligência,
              <br />
              <span className="azzi-serif-accent">disponível por API</span>
            </>
          }
          descricao="Tudo o que esta página faz passa por estas rotas. O servidor roda em localhost:3000 e responde JSON."
        />
        <RotasApi />
      </section>

      {/* 04 — Dados do evento */}
      <section id="dados" className="mx-auto max-w-7xl px-5 pt-24 lg:px-8">
        <SectionHead
          numero="04"
          titulo={
            <>
              Receba um relatório de
              <br />
              <span className="azzi-serif-accent">mapeamento da audiência</span>
            </>
          }
          descricao="Números de referência que a plataforma da Azzi entrega ao organizador e aos patrocinadores depois do evento."
        />
        <PainelDados />
      </section>

      <AzziFooter status={status} />
      <IdeaModal idea={aberta} onFechar={() => setAberta(null)} />
    </div>
  );
}

/** Aviso de topo quando nenhuma IA foi encontrada — aponta para o .doc. */
const AvisoSemIa: React.FC<{ detalhe: string }> = ({ detalhe }) => (
  <div className="mx-auto mt-10 max-w-7xl px-5 lg:px-8">
    <div className="flex flex-col gap-3 rounded-2xl border border-ink/15 bg-lime/25 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-ink/70" />
        <div>
          <p className="text-sm font-semibold text-ink">Nenhuma IA vinculada nesta máquina</p>
          <p className="mt-1 font-body text-sm text-ink/65">{detalhe}</p>
        </div>
      </div>
      <a
        href="/COMO-CONECTAR-IA.docx"
        download
        title="Baixar o guia de conexão (abre no Word)"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-ink px-4 py-2 text-xs text-paper transition hover:bg-ink-soft active:scale-[0.98] sm:self-auto"
      >
        <Download className="h-3.5 w-3.5" />
        COMO-CONECTAR-IA.docx
      </a>
    </div>
  </div>
);

const RotasApi: React.FC = () => {
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiar = async (p: string) => {
    await navigator.clipboard.writeText(`http://localhost:3000${p}`);
    setCopiado(p);
    setTimeout(() => setCopiado(null), 1600);
  };

  return (
    <ul className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/12 bg-white">
      {ROTAS.map((r) => (
        <li key={r.p} className="flex items-center gap-4 px-5 py-4 transition hover:bg-paper/60">
          <span
            className={`w-14 shrink-0 rounded px-2 py-1 text-center font-mono text-[10px] font-bold ${
              r.m === 'GET' ? 'bg-lime text-ink' : 'bg-ink text-paper'
            }`}
          >
            {r.m}
          </span>
          <div className="min-w-0 flex-1">
            <code className="block break-all font-mono text-[13px] text-ink">{r.p}</code>
            <p className="mt-0.5 font-body text-xs text-ink/55">{r.d}</p>
          </div>
          <button
            type="button"
            onClick={() => copiar(r.p)}
            title="Copiar URL completa"
            className="shrink-0 rounded-full p-2 text-ink/35 transition hover:bg-ink/5 hover:text-ink"
          >
            {copiado === r.p ? (
              <Check className="h-4 w-4 text-lime-deep" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

/** Le os endpoints de dados ja existentes no servidor e mostra os numeros-chave. */
const PainelDados: React.FC = () => {
  const [evento, setEvento] = useState<any>(null);
  const [survey, setSurvey] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/copacking/current-plate')
      .then((r) => r.json())
      .then((d) => setEvento(d.plate))
      .catch(() => undefined);
    fetch('/api/v1/esg/passports')
      .then((r) => r.json())
      .then((d) => setSurvey(d.records?.[0]))
      .catch(() => undefined);
  }, []);

  const cartoes = [
    { v: evento ? evento.totalAttendees.toLocaleString('pt-BR') : '—', r: 'público total' },
    { v: evento ? evento.totalPhotosCaptured.toLocaleString('pt-BR') : '—', r: 'fotos capturadas' },
    { v: evento ? `${evento.engagementRatePercent}%` : '—', r: 'engajamento', destaque: true },
    { v: evento ? String(evento.averageSatisfactionNps) : '—', r: 'NPS médio' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div
            key={c.r}
            className={`rounded-2xl border border-ink/12 p-6 ${c.destaque ? 'bg-lime' : 'bg-white'}`}
          >
            <div className="font-display text-4xl font-bold leading-none text-ink">{c.v}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/50">{c.r}</div>
          </div>
        ))}
      </div>

      {survey?.nlpSentimentSummary && (
        <div className="rounded-2xl border border-ink/12 bg-white p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">
            O que o público falou
          </p>
          <p className="mt-3 font-display text-xl italic leading-relaxed text-ink/85">
            “{survey.nlpSentimentSummary.actionableInsight}”
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {survey.nlpSentimentSummary.topKeywords.map((k: string) => (
              <span
                key={k}
                className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink/65"
              >
                {k}
              </span>
            ))}
          </div>
          <div className="mt-6 flex gap-1.5 overflow-hidden rounded-full">
            <div
              className="h-2 bg-lime"
              style={{ width: `${survey.nlpSentimentSummary.positivePercent}%` }}
              title={`positivo ${survey.nlpSentimentSummary.positivePercent}%`}
            />
            <div
              className="h-2 bg-blush"
              style={{ width: `${survey.nlpSentimentSummary.neutralPercent}%` }}
              title={`neutro ${survey.nlpSentimentSummary.neutralPercent}%`}
            />
            <div
              className="h-2 bg-rose"
              style={{ width: `${survey.nlpSentimentSummary.negativePercent}%` }}
              title={`negativo ${survey.nlpSentimentSummary.negativePercent}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
