/**
 * Camada única de IA do AzziBrain.
 *
 * Motivo de existir: o projeto original falava SOMENTE com o Gemini via
 * GEMINI_API_KEY. Isso obriga cada pessoa que roda o projeto a ter uma chave
 * paga em mãos. Aqui a ordem se inverte: o servidor procura, no momento do
 * boot, qual IA JÁ existe na máquina de quem iniciou, e se liga nela sozinho.
 *
 * Ordem de preferência (a primeira que responder vence):
 *   1. claude-cli  -> CLI do Claude Code local (sem chave, usa o login do usuário)
 *   2. claude-api  -> ANTHROPIC_API_KEY no ambiente / .env
 *   3. gemini-cli  -> CLI do Gemini instalado localmente
 *   4. gemini-api  -> GEMINI_API_KEY no ambiente / .env  (caminho original do projeto)
 *   5. heuristic   -> respostas determinísticas embutidas, sem rede
 *
 * Dá para forçar um provedor específico com AI_PROVIDER=<id> no .env.
 */

import { spawn, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import os from 'os';
import path from 'path';

export type ProviderId =
  | 'claude-cli'
  | 'claude-api'
  | 'gemini-cli'
  | 'gemini-api'
  | 'heuristic';

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  detail: string;
  /** false apenas no heurístico: não há IA real ligada. */
  live: boolean;
  /** caminho do binário, quando o provedor for um CLI local. */
  binPath?: string;
}

const IS_WIN = process.platform === 'win32';

function stripQuotes(s: string): string {
  return s.replace(/^"|"$/g, '').trim();
}

/**
 * Procura um executável no PATH: `where` no Windows, `which` no resto. O CLI do
 * Claude costuma ser um .cmd no Windows e um shim sh no Unix, por isso não dá
 * para assumir extensão.
 */
function lookupOnPath(bin: string): string | null {
  // where.exe/which são binários reais: chamar sem shell evita o aviso
  // DEP0190 do Node sobre argumentos não escapados.
  const cmd = IS_WIN ? 'where.exe' : 'which';
  const r = spawnSync(cmd, [bin], { encoding: 'utf8', timeout: 8000 });
  if ((r.status ?? 1) !== 0) return null;
  const first = String(r.stdout || '')
    .split(/\r?\n/)
    .map((l) => stripQuotes(l))
    .filter(Boolean)[0];
  return first || null;
}

/**
 * Locais onde o Claude Code se instala fora do PATH. Vale checar porque o
 * instalador nativo e o npm global nem sempre exportam PATH para processos
 * não-interativos (que é justamente o caso deste servidor).
 */
function knownClaudePaths(): string[] {
  const home = os.homedir();
  const appdata = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  const local = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
  if (IS_WIN) {
    return [
      path.join(home, '.local', 'bin', 'claude.exe'),
      path.join(home, '.local', 'bin', 'claude.cmd'),
      path.join(home, '.claude', 'local', 'claude.exe'),
      path.join(home, '.claude', 'local', 'claude.cmd'),
      path.join(appdata, 'npm', 'claude.cmd'),
      path.join(local, 'Programs', 'claude', 'claude.exe'),
    ];
  }
  return [
    path.join(home, '.local', 'bin', 'claude'),
    path.join(home, '.claude', 'local', 'claude'),
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
  ];
}

function knownGeminiPaths(): string[] {
  const home = os.homedir();
  const appdata = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
  return IS_WIN
    ? [path.join(appdata, 'npm', 'gemini.cmd'), path.join(home, '.local', 'bin', 'gemini.exe')]
    : [
        path.join(home, '.local', 'bin', 'gemini'),
        '/usr/local/bin/gemini',
        '/opt/homebrew/bin/gemini',
      ];
}

function findBinary(name: 'claude' | 'gemini'): string | null {
  const onPath = lookupOnPath(name);
  if (onPath && existsSync(onPath)) return onPath;
  const candidates = name === 'claude' ? knownClaudePaths() : knownGeminiPaths();
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

function anthropicModel(): string {
  return (process.env.ANTHROPIC_MODEL || 'claude-sonnet-5').trim();
}

// -------------------------------------------------------------------------
// Detecção
// -------------------------------------------------------------------------

let cached: ProviderInfo | null = null;

export function detectProvider(force = false): ProviderInfo {
  if (cached && !force) return cached;

  const forced = (process.env.AI_PROVIDER || '').trim() as ProviderId | '';
  const claudeBin = findBinary('claude');
  const geminiBin = findBinary('gemini');
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

  // Chave de exemplo do .env.example não conta como chave configurada.
  const keyLooksReal = (k: string) => k.length > 10 && !/^MY_/.test(k);

  const options: Record<ProviderId, ProviderInfo | null> = {
    'claude-cli': claudeBin
      ? {
          id: 'claude-cli',
          label: 'Claude Code (CLI local)',
          detail: 'Ligado ao Claude já instalado nesta máquina. Não precisa de chave de API.',
          live: true,
          binPath: claudeBin,
        }
      : null,
    'claude-api': keyLooksReal(anthropicKey)
      ? {
          id: 'claude-api',
          label: 'Claude (API Anthropic)',
          detail: `Usando ANTHROPIC_API_KEY com o modelo ${anthropicModel()}.`,
          live: true,
        }
      : null,
    'gemini-cli': geminiBin
      ? {
          id: 'gemini-cli',
          label: 'Gemini (CLI local)',
          detail: 'Ligado ao Gemini CLI instalado nesta máquina.',
          live: true,
          binPath: geminiBin,
        }
      : null,
    'gemini-api': keyLooksReal(geminiKey)
      ? {
          id: 'gemini-api',
          label: 'Gemini (API Google)',
          detail: 'Usando GEMINI_API_KEY — caminho original do projeto.',
          live: true,
        }
      : null,
    heuristic: {
      id: 'heuristic',
      label: 'Modo heurístico (sem IA)',
      detail:
        'Nenhuma IA encontrada nesta máquina. A API responde com o conteúdo determinístico embutido. Veja COMO-CONECTAR-IA.docx.',
      live: false,
    },
  };

  if (forced && options[forced]) {
    cached = options[forced]!;
    return cached;
  }

  const order: ProviderId[] = ['claude-cli', 'claude-api', 'gemini-cli', 'gemini-api', 'heuristic'];
  for (const id of order) {
    if (options[id]) {
      cached = options[id]!;
      return cached;
    }
  }
  cached = options.heuristic!;
  return cached;
}

// -------------------------------------------------------------------------
// Geração
// -------------------------------------------------------------------------

export interface GenerateArgs {
  prompt: string;
  system?: string;
  /** texto determinístico usado quando não há IA ou quando a IA falha */
  fallback: string;
}

export interface GenerateResult {
  text: string;
  provider: ProviderId;
  /** true quando não veio de IA real (heurístico ou erro tratado) */
  simulated: boolean;
}

export async function generate(args: GenerateArgs): Promise<GenerateResult> {
  const p = detectProvider();
  try {
    switch (p.id) {
      case 'claude-cli':
        return { text: await runClaudeCli(p.binPath!, args), provider: p.id, simulated: false };
      case 'claude-api':
        return { text: await runAnthropicApi(args), provider: p.id, simulated: false };
      case 'gemini-cli':
        return { text: await runGeminiCli(p.binPath!, args), provider: p.id, simulated: false };
      case 'gemini-api':
        return { text: await runGeminiApi(args), provider: p.id, simulated: false };
      default:
        return { text: args.fallback, provider: 'heuristic', simulated: true };
    }
  } catch (err: any) {
    // Falha de IA nunca derruba a API: cai no texto determinístico e avisa no log.
    console.warn(`[AzziBrain] provedor ${p.id} falhou: ${err?.message}. Usando fallback.`);
    return { text: args.fallback, provider: p.id, simulated: true };
  }
}

/**
 * Executa um processo mandando o prompt pelo stdin. Passar prompt gigante como
 * argumento estoura o limite de linha de comando do Windows (~32k), então stdin
 * é o único caminho seguro.
 */
function runProcess(bin: string, argv: string[], stdin: string, timeoutMs = 180000): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, argv, { shell: IS_WIN, windowsHide: true });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`timeout após ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(err.trim() || `saiu com código ${code}`));
      resolve(out);
    });

    child.stdin.write(stdin);
    child.stdin.end();
  });
}

/**
 * Claude Code em modo headless: `-p` lê o prompt do stdin e `--output-format json`
 * devolve um envelope cujo campo `result` traz o texto final.
 */
async function runClaudeCli(bin: string, args: GenerateArgs): Promise<string> {
  const argv = ['-p', '--output-format', 'json'];
  if (args.system) argv.push('--append-system-prompt', JSON.stringify(args.system));
  const raw = await runProcess(bin, argv, args.prompt);
  try {
    const parsed = JSON.parse(raw);
    const text = parsed.result ?? parsed.text ?? '';
    if (typeof text === 'string' && text.trim()) return text.trim();
    throw new Error('json sem campo result');
  } catch {
    // Versões antigas imprimem texto puro em vez de JSON; aproveitamos assim mesmo.
    if (raw.trim()) return raw.trim();
    throw new Error('resposta vazia do claude cli');
  }
}

/** Gemini CLI headless: lê o prompt do stdin quando `-p` vem sem valor. */
async function runGeminiCli(bin: string, args: GenerateArgs): Promise<string> {
  const full = args.system ? `${args.system}\n\n---\n\n${args.prompt}` : args.prompt;
  const raw = await runProcess(bin, ['-p'], full);
  if (!raw.trim()) throw new Error('resposta vazia do gemini cli');
  return raw.trim();
}

/** API Messages da Anthropic via fetch nativo do Node 18+, sem dependência nova. */
async function runAnthropicApi(args: GenerateArgs): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': (process.env.ANTHROPIC_API_KEY || '').trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: anthropicModel(),
      max_tokens: 4096,
      ...(args.system ? { system: args.system } : {}),
      messages: [{ role: 'user', content: args.prompt }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data: any = await res.json();
  const text = (data.content || []).map((b: any) => b.text || '').join('').trim();
  if (!text) throw new Error('anthropic devolveu conteúdo vazio');
  return text;
}

/** Caminho original do projeto, preservado: @google/genai com GEMINI_API_KEY. */
async function runGeminiApi(args: GenerateArgs): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  const cfg = args.system ? { config: { systemInstruction: args.system } } : {};
  const model = (process.env.GEMINI_MODEL || 'gemini-3.7-flash').trim();
  try {
    const r = await ai.models.generateContent({ model, contents: args.prompt, ...cfg });
    const t = (r.text || '').trim();
    if (t) return t;
    throw new Error('gemini devolveu vazio');
  } catch {
    const r = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: args.prompt,
      ...cfg,
    });
    const t = (r.text || '').trim();
    if (!t) throw new Error('gemini (lite) devolveu vazio');
    return t;
  }
}
