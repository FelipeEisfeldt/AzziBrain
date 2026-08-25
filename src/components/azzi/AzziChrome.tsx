import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AiStatusBadge, type AiStatus } from './AiStatusBadge';

/**
 * Cromo da pagina (topo, hero, faixa de marcas e rodape) reproduzindo a
 * linguagem visual de azzi.digital: preto sobre off-white, acento verde-limao,
 * titulos em Playfair Display com a segunda linha em italico serifado e as
 * secoes numeradas 01/02/03.
 */

interface NavProps {
  status: AiStatus | null;
  onRefreshStatus: () => void;
  refreshing: boolean;
  onPrimaryAction: () => void;
  primaryBusy: boolean;
}

const LINKS = [
  { href: '#ideias', label: 'Ideias' },
  { href: '#consultor', label: 'Consultor' },
  { href: '#dados', label: 'Pesquisa & Dados' },
  { href: '#api', label: 'API' },
];

export const AzziNav: React.FC<NavProps> = ({
  status,
  onRefreshStatus,
  refreshing,
  onPrimaryAction,
  primaryBusy,
}) => (
  <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
      <a href="#topo" className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold tracking-tight text-ink">Azzi</span>
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-ink/45 sm:block">
          Brain
        </span>
      </a>

      <nav className="hidden items-center gap-8 md:flex">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-sm text-ink/70 transition-colors hover:text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <AiStatusBadge status={status} onRefresh={onRefreshStatus} refreshing={refreshing} />
        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={primaryBusy}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink-soft active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${primaryBusy ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">
            {primaryBusy ? 'Gerando…' : 'Gerar novas ideias'}
          </span>
          <span className="sm:hidden">{primaryBusy ? '…' : 'Gerar'}</span>
        </button>
      </div>
    </div>
  </header>
);

interface HeroProps {
  total: number;
  comIa: number;
}

export const AzziHero: React.FC<HeroProps> = ({ total, comIa }) => (
  <section id="topo" className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-8 lg:pt-24">
    {/* Assinatura de autoria no topo: discreta, na mesma linha de contexto. */}
    <p className="mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">
      <span>Motor de ideias · azzi.digital</span>
      <span aria-hidden="true" className="text-ink/25">
        /
      </span>
      <span className="text-ink/60">
        API elaborada por <span className="text-ink">Felipe Eisfeldt</span>
      </span>
    </p>

    <h1 className="max-w-4xl text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl lg:text-7xl">
      Capture dados estratégicos
      <br />
      e <span className="azzi-serif-accent">evolua seu evento</span>
    </h1>

    <p className="mt-7 max-w-2xl font-body text-lg leading-relaxed text-ink/65">
      As fotografias do seu evento podem te ajudar a entender melhor sua audiência. O AzziBrain
      transforma esse contexto em ideias de produto prontas para desenvolver — com problema,
      arquitetura, rotas de API e prompt de implementação.
    </p>

    <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
      <Stat valor={String(total)} rotulo="ideias no grid" />
      <Stat valor={String(comIa)} rotulo="geradas por IA" destaque />
      <Stat valor="70–91%" rotulo="engajamento em survey" />
    </div>
  </section>
);

const Stat: React.FC<{ valor: string; rotulo: string; destaque?: boolean }> = ({
  valor,
  rotulo,
  destaque,
}) => (
  <div>
    <div
      className={`font-display text-4xl font-bold leading-none ${
        destaque ? 'text-ink' : 'text-ink'
      }`}
    >
      {valor}
      {destaque && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-lime align-super" />}
    </div>
    <div className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/45">{rotulo}</div>
  </div>
);

const PARCEIROS = [
  'Cais Embarcadeiro',
  'Prefeitura de Porto Alegre',
  'Campus Party',
  'Heineken Lounge',
  'Banrisul Inovação',
  'Festival Sunset',
];

/** Faixa rolante equivalente ao "MARCAS E EVENTOS QUE CONFIAM" do site. */
export const BrandMarquee: React.FC = () => (
  <section className="overflow-hidden border-y border-ink/10 bg-ink py-6">
    <p className="mb-5 px-5 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-paper/45">
      Marcas e eventos que confiam
    </p>
    <div className="relative flex overflow-hidden">
      <div className="azzi-marquee-track flex shrink-0 items-center gap-14 pr-14">
        {[...PARCEIROS, ...PARCEIROS].map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="whitespace-nowrap font-display text-xl font-medium text-paper/75"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  </section>
);

interface SectionHeadProps {
  numero: string;
  titulo: React.ReactNode;
  descricao?: string;
  acao?: React.ReactNode;
}

/** Cabecalho de secao numerado, no formato "01 — Titulo" usado no site. */
export const SectionHead: React.FC<SectionHeadProps> = ({
  numero,
  titulo,
  descricao,
  acao,
}) => (
  <div className="mb-10 flex flex-col gap-6 border-t border-ink/15 pt-8 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      <span className="azzi-step-number text-ink/40">{numero}</span>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
        {titulo}
      </h2>
      {descricao && (
        <p className="mt-4 font-body text-base leading-relaxed text-ink/60">{descricao}</p>
      )}
    </div>
    {acao && <div className="shrink-0">{acao}</div>}
  </div>
);

export const AzziFooter: React.FC<{ status: AiStatus | null }> = ({ status }) => (
  <footer className="mt-24 border-t border-ink/10 bg-ink text-paper">
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <span className="font-display text-3xl font-bold">Azzi</span>
          <p className="mt-4 font-body text-sm leading-relaxed text-paper/60">
            Transformamos cliques em decisões mais inteligentes. Este painel roda localmente na
            sua máquina e não envia nada para servidores da Azzi.
          </p>
        </div>

        {/* Crédito de autoria: no rodape ele aparece com peso, sem competir
            com a marca Azzi que encabeca a coluna da esquerda. */}
        <div className="text-sm">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
            Autoria
          </p>
          <p className="font-display text-xl leading-snug text-paper">
            API elaborada por
            <br />
            <span className="italic">Felipe Eisfeldt</span>
          </p>
          <span className="mt-3 block h-0.5 w-10 rounded-full bg-lime" />
          <p className="mt-3 max-w-[15rem] font-body text-xs leading-relaxed text-paper/50">
            Concepção, arquitetura e implementação do motor de ideias.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
            Estado da execução
          </p>
          <ul className="space-y-2 font-body text-paper/70">
            <li>
              Servidor: <span className="text-lime">http://localhost:3000</span>
            </li>
            <li>
              IA vinculada:{' '}
              <span className={status?.live ? 'text-lime' : 'text-blush'}>
                {status?.label ?? 'detectando…'}
              </span>
            </li>
            {!status?.live && (
              <li className="text-blush">
                Veja{' '}
                <a
                  href="/COMO-CONECTAR-IA.docx"
                  download
                  className="font-semibold underline decoration-blush/40 underline-offset-2 transition-colors hover:text-lime hover:decoration-lime"
                >
                  COMO-CONECTAR-IA.docx
                </a>{' '}
                na raiz do projeto.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-paper/15 pt-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <span>AzziBrain · painel local de geração de ideias · © Felipe Eisfeldt</span>
        <a
          href="https://www.azzi.digital/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-paper"
        >
          azzi.digital <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  </footer>
);
