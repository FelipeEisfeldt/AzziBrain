import React from 'react';
import { Cpu, RefreshCw, TriangleAlert } from 'lucide-react';

export interface AiStatus {
  provider: string;
  label: string;
  detail: string;
  live: boolean;
  binPath?: string;
}

interface Props {
  status: AiStatus | null;
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Selo que mostra a QUAL IA o servidor se ligou nesta maquina. E a peca central
 * do requisito de vinculacao automatica: sem esse retorno visivel, quem roda o
 * projeto nao tem como saber se esta falando com o Claude, com o Gemini ou com
 * o modo heuristico.
 */
export const AiStatusBadge: React.FC<Props> = ({ status, onRefresh, refreshing }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/50">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        Detectando IA…
      </span>
    );
  }

  const conectado = status.live;

  return (
    <span
      title={status.detail + (status.binPath ? `\n${status.binPath}` : '')}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        conectado
          ? 'border-ink/15 bg-lime/35 text-ink'
          : 'border-rose/30 bg-rose/10 text-rose',
      ].join(' ')}
    >
      {conectado ? (
        <span className="azzi-pulse-dot h-2 w-2 rounded-full bg-ink" />
      ) : (
        <TriangleAlert className="h-3.5 w-3.5" />
      )}

      <Cpu className="hidden h-3.5 w-3.5 sm:block" />
      <span className="max-w-[15rem] truncate">{status.label}</span>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        title="Procurar IA de novo nesta máquina"
        className="ml-0.5 rounded-full p-0.5 opacity-55 transition hover:opacity-100 disabled:opacity-30"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </span>
  );
};
