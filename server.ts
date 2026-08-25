import express from 'express';
import path from 'path';
import { existsSync } from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { detectProvider, generate } from './src/server/aiProvider.ts';
import type { AiTextFn } from './src/engine/ideaGeneratorEngine.ts';
import {
  getActiveCards,
  regenerateCardAtIndex,
  regenerateAllCards,
  GeneratedIdea,
} from './src/engine/ideaGeneratorEngine.ts';
import {
  AzziEventActivation,
  AzziBiometricLedgerRecord,
  AzziSurveySentimentRecord,
} from './src/types/innovations.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

/**
 * Ponte entre o motor de ideias e a IA que estiver ligada nesta máquina.
 * Devolve null quando não há IA real, para o motor cair direto no gerador
 * procedural em vez de gastar uma ida e volta inútil.
 */
function getAiTextFn(): AiTextFn | null {
  if (!detectProvider().live) return null;
  return async (prompt: string, system?: string) => {
    const r = await generate({ prompt, ...(system ? { system } : {}), fallback: '' });
    if (r.simulated || !r.text) throw new Error('provedor de IA indisponível');
    return r.text;
  };
}

// Diz ao front qual IA foi encontrada, para a interface mostrar o selo de conexão.
app.get('/api/v1/ai/status', (req, res) => {
  const p = detectProvider(req.query.refresh === '1');
  res.json({
    success: true,
    provider: p.id,
    label: p.label,
    detail: p.detail,
    live: p.live,
    ...(p.binPath ? { binPath: p.binPath } : {}),
  });
});

/**
 * Entrega o guia de conexão pelo próprio servidor. O navegador não abre arquivo
 * do disco a partir de uma página, então sem esta rota o aviso da interface
 * seria só um texto sem ação — que foi exatamente o que aconteceu.
 * Em produção o build vai para dist/, mas o .docx fica na raiz do projeto.
 */
app.get('/COMO-CONECTAR-IA.docx', (req, res) => {
  const candidatos = [
    path.join(process.cwd(), 'COMO-CONECTAR-IA.docx'),
    path.join(process.cwd(), '..', 'COMO-CONECTAR-IA.docx'),
  ];
  const encontrado = candidatos.find((c) => existsSync(c));
  if (!encontrado) {
    return res
      .status(404)
      .send('COMO-CONECTAR-IA.docx não encontrado. Rode: npm run doc');
  }
  res.download(encontrado, 'COMO-CONECTAR-IA.docx');
});

// =========================================================================
// DATA STRUCTURES FOR AZZI: EVENT INTELLIGENCE & RECOGNITION PLATFORM
// =========================================================================

// 1. DOMAIN 1: AZZI LIVE EVENT ACTIVATION & SPONSOR COCKPIT
let sampleEventActivation: AzziEventActivation = {
  eventId: 'EVT-CAIS-POA-2026',
  eventName: 'Festival Sunset Cais Embarcadeiro',
  partnerName: 'Cais Embarcadeiro & Prefeitura de Porto Alegre',
  venueLocation: 'Orla do Guaíba, Porto Alegre - RS',
  totalAttendees: 14250,
  totalPhotosCaptured: 3840,
  facialMatchesDelivered: 3410,
  surveysCompleted: 3012,
  engagementRatePercent: 88.3, // Entre 70% e 91%
  averageSatisfactionNps: 84,
  sponsorImpressions: 48900,
  primaryMood: 'Alegria & Empolgação',
  sponsorBooths: [
    {
      boothId: 'SPN-01',
      brandName: 'Heineken Lounge Sunset',
      colorHex: '#008234',
      dwellTimeMinutesAvg: 18.5,
      leadsCaptured: 1140,
      costPerEngagementBrl: 4.85,
      brandRecallPercent: 92.4,
      optInLgpdPercent: 94.0,
    },
    {
      boothId: 'SPN-02',
      brandName: 'Banrisul Inovação & Fintech',
      colorHex: '#005baa',
      dwellTimeMinutesAvg: 12.0,
      leadsCaptured: 890,
      costPerEngagementBrl: 6.2,
      brandRecallPercent: 88.0,
      optInLgpdPercent: 91.5,
    },
    {
      boothId: 'SPN-03',
      brandName: 'Campus Party Tech Arena',
      colorHex: '#ff6b00',
      dwellTimeMinutesAvg: 22.4,
      leadsCaptured: 982,
      costPerEngagementBrl: 3.9,
      brandRecallPercent: 95.2,
      optInLgpdPercent: 96.0,
    },
  ],
};

// 2. DOMAIN 2: AZZI BIOMETRIC LEDGER & LGPD PRIVACY VAULT
let sampleBiometricRecords: AzziBiometricLedgerRecord[] = [
  {
    recordId: 'BIO-POA-8821',
    timestamp: 'Hoje, 17:45:12',
    partnerSlug: 'cais-embarcadeiro',
    eventStage: 'Palco Sunset Principal',
    photosIndexedCount: 1420,
    matchLatencyMs: 142,
    faceDetectionAccuracyPercent: 99.4,
    lgpdConsentMode: 'EXPLICIT_OPT_IN_ZERO_KNOWLEDGE',
    encryptedEmbeddingHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    emotionsDetected: {
      joy: 78.4,
      energy: 84.0,
      focus: 62.1,
      neutral: 8.5,
    },
    status: 'SYNCHRONIZED',
  },
  {
    recordId: 'BIO-CP-9014',
    timestamp: 'Hoje, 16:30:00',
    partnerSlug: 'campus-party-poa',
    eventStage: 'Arena Hackathon & Startups',
    photosIndexedCount: 980,
    matchLatencyMs: 128,
    faceDetectionAccuracyPercent: 99.7,
    lgpdConsentMode: 'EPHEMERAL_VECTOR_ONLY',
    encryptedEmbeddingHash: 'sha256-5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    emotionsDetected: {
      joy: 65.0,
      energy: 92.0,
      focus: 89.4,
      neutral: 6.2,
    },
    status: 'SYNCHRONIZED',
  },
  {
    recordId: 'BIO-PREF-4412',
    timestamp: 'Hoje, 15:15:40',
    partnerSlug: 'pref-porto-alegre',
    eventStage: 'Feira Cultural Centro Histórico',
    photosIndexedCount: 1440,
    matchLatencyMs: 165,
    faceDetectionAccuracyPercent: 99.1,
    lgpdConsentMode: 'EXPLICIT_OPT_IN_ZERO_KNOWLEDGE',
    encryptedEmbeddingHash: 'sha256-4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    emotionsDetected: {
      joy: 82.1,
      energy: 71.0,
      focus: 58.0,
      neutral: 11.2,
    },
    status: 'ANONYMIZED_AFTER_DELIVERY',
  },
];

// 3. DOMAIN 3: AZZI SENTIMENT & MICRO-SURVEY MATRIX (70%-91% CONVERSION)
let sampleSurveyRecords: AzziSurveySentimentRecord[] = [
  {
    surveyId: 'SRV-CAIS-8820',
    eventName: 'Festival Cais Embarcadeiro 2026',
    targetAudienceSegment: 'Público Geral & Turistas em Porto Alegre',
    triggerMoment: 'INSTANT_PHOTO_UNLOCK',
    totalDispatched: 3410,
    totalAnswered: 3012,
    conversionRatePercent: 88.3,
    averageTimeSeconds: 21,
    questionsBreakdown: [
      {
        question: 'Como você avalia a experiência no Cais Embarcadeiro hoje?',
        type: 'NPS',
        topAnswer: 'Nota 10 (Promotores: 86%)',
        scorePercent: 94.2,
      },
      {
        question: 'Qual ativação de marca mais chamou sua atenção?',
        type: 'BRAND_RECALL',
        topAnswer: 'Lounge Heineken Sunset (48%)',
        scorePercent: 78.5,
      },
      {
        question: 'Você participaria da próxima edição com desconto exclusivo?',
        type: 'MULTIPLE_CHOICE',
        topAnswer: 'Sim, com certeza! (91.8%)',
        scorePercent: 91.8,
      },
    ],
    nlpSentimentSummary: {
      positivePercent: 92.5,
      neutralPercent: 5.8,
      negativePercent: 1.7,
      topKeywords: ['pôr do sol', 'organização', 'música', 'segurança', 'fotos lindas', 'rápido'],
      actionableInsight:
        'Público expressou altíssima satisfação com a velocidade de entrega das fotos no WhatsApp. 91.8% querem receber novidades de patrocinadores.',
    },
  },
];

// =========================================================================
// API ENDPOINTS FOR AZZI STRATEGIC HUBS
// =========================================================================

// --- ABA 1: EVENT ACTIVATION & SPONSOR COCKPIT ---
app.post('/api/v1/copacking/optimize-plate', (req, res) => {
  const { plateName = 'Ativação Otimizada Azzi Digital' } = req.body;

  sampleEventActivation = {
    ...sampleEventActivation,
    eventName: plateName,
    totalAttendees: 15400,
    totalPhotosCaptured: 4200,
    facialMatchesDelivered: 3820,
    surveysCompleted: 3440,
    engagementRatePercent: 90.1,
    averageSatisfactionNps: 87,
  };

  res.json({ success: true, plate: sampleEventActivation });
});

app.get('/api/v1/copacking/current-plate', (req, res) => {
  res.json({ success: true, plate: sampleEventActivation });
});

// --- ABA 2: BIOMETRIC LEDGER & LGPD VAULT ---
app.get('/api/v1/spool-ledger/degradation', (req, res) => {
  res.json({ success: true, spools: sampleBiometricRecords });
});

app.post('/api/v1/spool-ledger/dispatch-bake-cycle', (req, res) => {
  const { spoolId } = req.body;
  const target = sampleBiometricRecords.find((s) => s.recordId === spoolId);

  if (target) {
    target.status = 'ANONYMIZED_AFTER_DELIVERY';
    target.matchLatencyMs = 98;
  }

  res.json({
    success: true,
    message: `Auditoria e anonimização de vetores LGPD executada com sucesso para o lote ${spoolId}.`,
    spool: target,
  });
});

// --- ABA 3: SURVEY & SENTIMENT INTELLIGENCE ---
app.get('/api/v1/esg/passports', (req, res) => {
  res.json({ success: true, records: sampleSurveyRecords });
});

app.post('/api/v1/esg/calculate-passport', (req, res) => {
  const {
    eventName = 'Novo Evento Corporativo Azzi',
    partnerName = 'Campus Party Porto Alegre',
    targetAudience = 'Tech & Desenvolvedores',
    estimatedAttendees = 5000,
  } = req.body;

  const dispatched = Math.round(estimatedAttendees * 0.85);
  const answered = Math.round(dispatched * 0.89);
  const rate = Math.round((answered / dispatched) * 1000) / 10;

  const newRecord: AzziSurveySentimentRecord = {
    surveyId: `SRV-AZZI-${Date.now().toString(36).toUpperCase()}`,
    eventName,
    targetAudienceSegment: targetAudience,
    triggerMoment: 'INSTANT_PHOTO_UNLOCK',
    totalDispatched: dispatched,
    totalAnswered: answered,
    conversionRatePercent: rate,
    averageTimeSeconds: 18,
    questionsBreakdown: [
      {
        question: 'Qual a sua avaliação geral da infraestrutura e tecnologia do evento?',
        type: 'NPS',
        topAnswer: 'Excelente / Promotor (89%)',
        scorePercent: 92.0,
      },
      {
        question: 'Qual estande mais surpreendeu você hoje?',
        type: 'BRAND_RECALL',
        topAnswer: `${partnerName} (62%)`,
        scorePercent: 84.5,
      },
    ],
    nlpSentimentSummary: {
      positivePercent: 94.0,
      neutralPercent: 4.5,
      negativePercent: 1.5,
      topKeywords: ['inovação', 'conexão', 'agilidade', 'reconhecimento facial'],
      actionableInsight:
        'Engajamento recorde impulsionado pelo desbloqueio instantâneo de fotos em 4K.',
    },
  };

  sampleSurveyRecords.unshift(newRecord);
  res.json({ success: true, record: newRecord });
});

// Helper function for deterministic architectural System Prompt synthesis for Azzi
function buildDeterministicArchitecturalPrompt(params: {
  title: string;
  category: string;
  problem: string;
  innovation: string;
  impact?: string;
  existingPrompt?: string;
}): string {
  const { title, category, problem, innovation, impact, existingPrompt } = params;

  if (existingPrompt && existingPrompt.length > 200) {
    return `${existingPrompt}\n\n---\n### 🚀 DIRETRIZES DE ENGENHARIA AZZI DIGITAL\n- **Segurança LGPD**: Processamento de vetores faciais em memória volátil com expiração automática após entrega da foto.\n- **Taxa de Engajamento Alvo**: 70% a 91% no micro-survey de desbloqueio em 15 segundos.\n- **SLA de Resposta**: < 300ms de latência de busca no banco vetorial com 100.000 fotos indexadas.`;
  }

  return `# SYSTEM PROMPT: ${title.toUpperCase()} (AZZI EVENT INTELLIGENCE PLATFORM)

Você é o Arquiteto de Software Principal e Especialista em Event Tech da Azzi (https://azzi.digital).
Azzi é uma startup gaúcha que transforma fotos de eventos em dados estratégicos. Utilizamos reconhecimento facial e surveys personalizados para extrair informações valiosas do público, com taxas médias de engajamento entre 70% e 91%.
Parceiros: Cais Embarcadeiro, Prefeitura de Porto Alegre, Campus Party. Slogan: "Transformamos cliques em decisões mais inteligentes".

## 1. PAPEL E IDENTIDADE DO ENGENHEIRO
Você é responsável por projetar e implementar o módulo **${title}**. O código deve seguir estritamente os princípios de Clean Architecture, conformidade com a LGPD e comunicação em tempo real de alta escala.

## 2. CONTEXTO DO PROBLEMA & DOMÍNIO
- **Categoria**: ${category}
- **O Problema Oculto**: ${problem}
- **Por que Soluções Atuais Falham**: Métodos tradicionais dependem de pesquisas frias por e-mail com <3% de resposta e galerias de fotos manuais desorganizadas.

## 3. SOLUÇÃO TÉCNICA AZZI
${innovation}

## 4. ARQUITETURA DE MÓDULOS DE SOFTWARE
1. **Facial Recognition & Vector Extraction Ingestion**: Ingestão e extração de embeddings 512-D em tempo real.
2. **15-Second Micro-Survey Gatekeeper**: Componente interativo de pesquisa acoplado ao desbloqueio da foto em alta resolução (engajamento 70%-91%).
3. **Sponsor ROI & Lead Enrichment Pipeline**: Consolidação de Custo por Engajamento Real (CPE) e sincronização com CRMs.
4. **LGPD Zero-Knowledge Consent Registry**: Registro criptográfico de consentimento e purge de dados biométricos.

## 5. SCHEMAS E TIPAGENS TYPESCRIPT
\`\`\`typescript
export interface ${title.replace(/[^a-zA-Z0-9]/g, '')}Payload {
  eventId: string;
  partnerSlug: 'cais-embarcadeiro' | 'campus-party-poa' | 'pref-porto-alegre' | string;
  timestamp: string;
  attendeeSessionId: string;
  selfieVectorHash: string;
  surveyResults: Array<{
    questionId: string;
    answer: string | number;
    score: number;
  }>;
  engagementMetrics: {
    timeToCompleteSeconds: number;
    optInMarketing: boolean;
    costPerEngagementBrl: number;
  };
}
\`\`\`

## 6. ENDPOINTS REST
- \`POST /api/v1/azzi/match-and-survey\` -> Realiza busca facial e retorna perguntas personalizadas.
- \`POST /api/v1/azzi/unlock-and-sync\` -> Registra respostas e libera link temporário 4K.
- \`GET /api/v1/azzi/sponsor-roi-live\` -> Retorna métricas de ativação para patrocinadores.

## 7. MÉTRICA DE IMPACTO & ROI
- **Impacto Alvo**: ${impact || '+88% de taxa de engajamento e inteligência em tempo real para organizadores e marcas.'}`;
}

// --- CONSULTOR ESTRATÉGICO (Claude ou Gemini, conforme a máquina) ---
app.post('/api/v1/ai/deep-analysis', async (req, res) => {
  const { prompt, contextDomain } = req.body;

  const systemInstruction = `Você é o Diretor de Tecnologia e Estrategista de Dados da startup gaúcha AZZI (https://azzi.digital).
A Azzi transforma fotos de eventos em dados estratégicos via reconhecimento facial e surveys com taxas de engajamento entre 70% e 91%.
Parceiros reais: Cais Embarcadeiro, Prefeitura de Porto Alegre e Campus Party. Slogan: "Transformamos cliques em decisões mais inteligentes".
Forneça análises de alto rigor técnico, com estratégias de dados, ROI para patrocinadores, conformidade ética com a LGPD e modelos de monetização em eventos.`;

  const fallback = `[Análise Estratégica Azzi Event Intelligence]\n\nPara o domínio ${
    contextDomain || 'Inteligência de Eventos & Reconhecimento Facial'
  }: O modelo de micro-survey no momento do desbloqueio da foto atinge pico de 89.4% de resposta ao limitar a 2 perguntas diretas (NPS + Escolha Simples de Patrocinador) com tempo médio de resposta de 18 segundos. Para o Cais Embarcadeiro e Campus Party, a correlação entre reconhecimento facial em alta velocidade (< 200ms) e satisfação do usuário eleva a retenção e o opt-in de marketing para 94%.`;

  const r = await generate({
    prompt:
      prompt ||
      'Analise a melhor estratégia de micro-surveys para maximizar engajamento de público no Cais Embarcadeiro.',
    system: systemInstruction,
    fallback,
  });

  res.json({
    success: true,
    content: r.text,
    provider: r.provider,
    ...(r.simulated ? { isSimulated: true } : {}),
  });
});

// =========================================================================
// API ENDPOINTS FOR AZZI 20-CARD INFINITE GENERATOR
// =========================================================================

// Retorna os 20 cards ativos no grid
app.all('/api/v1/generator/ideas', (req, res) => {
  const excluded = Array.isArray(req.body?.excludedTitles)
    ? req.body.excludedTitles
    : req.query.excluded
    ? String(req.query.excluded).split(',')
    : [];
  const cards = getActiveCards(excluded);
  res.json({ success: true, ideas: cards });
});

// Regenera APENAS um card específico (index 0 a 19) no grid com ideia inédita da Azzi
app.post('/api/v1/generator/regenerate-card', async (req, res) => {
  const { cardIndex = 0, excludedTitles = [] } = req.body;
  const ai = getAiTextFn();

  try {
    const result = await regenerateCardAtIndex(
      Number(cardIndex),
      ai,
      Array.isArray(excludedTitles) ? excludedTitles : []
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error regenerating card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regenera todos os 20 cards simultaneamente para a Azzi
app.post('/api/v1/generator/regenerate-all', async (req, res) => {
  const { excludedTitles = [] } = req.body;
  const ai = getAiTextFn();
  try {
    const ideas = await regenerateAllCards(ai, Array.isArray(excludedTitles) ? excludedTitles : []);
    res.json({ success: true, ideas });
  } catch (error: any) {
    console.error('Error regenerating all cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gera um System Prompt ultra-detalhado com IA para a Azzi
app.post('/api/v1/generator/deep-prompt', async (req, res) => {
  const title = req.body.title || req.body.idea?.title || 'Módulo Inovador Azzi Event Intelligence';
  const category = req.body.category || req.body.idea?.category || 'Surveys & Engajamento 90%+';
  const problem =
    req.body.problem ||
    req.body.theProblem ||
    req.body.idea?.problem ||
    req.body.idea?.theProblem ||
    'Baixas taxas de resposta e falta de dados em eventos.';
  const innovation =
    req.body.innovation ||
    req.body.theInnovation ||
    req.body.solution ||
    req.body.idea?.solution ||
    req.body.idea?.theInnovation ||
    'Reconhecimento facial com micro-surveys no momento do desbloqueio da foto.';
  const impact =
    req.body.impact ||
    req.body.impactMetric ||
    req.body.idea?.impact ||
    req.body.idea?.impactMetric ||
    'Engajamento entre 70% e 91% comprovado.';
  const existingPrompt = req.body.systemPrompt || req.body.idea?.systemPrompt || '';

  const deterministico = buildDeterministicArchitecturalPrompt({
    title,
    category,
    problem,
    innovation,
    impact,
    existingPrompt,
  });

  const r = await generate({
    prompt: `Gere um SYSTEM PROMPT completo, estruturado e com alto rigor tecnico para a startup AZZI (https://azzi.digital), que transforma fotos de eventos em inteligencia de dados com reconhecimento facial e pesquisas (70%-91% engajamento):
Titulo: ${title}
Categoria: ${category}
Problema: ${problem}
Inovacao: ${innovation}
Impacto: ${impact}

O System Prompt deve conter:
1. Identidade do Engenheiro e Persona Azzi
2. Contexto do Problema e por que metodos tradicionais falham
3. Arquitetura de Modulos (Ingestao Facial, Micro-Surveys, Sponsor ROI, Cofre LGPD)
4. Schemas de Dados TypeScript
5. Contratos de API REST / WebSockets / Webhooks com payload de exemplo
6. Tratamento de Casos de Borda (pouca luz, fotos em grupo, opt-out LGPD)
7. Metricas de Sucesso e KPIs (taxa de 70%-91% de resposta)

Escreva em Markdown limpo para IDEs como Cursor, Claude ou AI Studio.`,
    fallback: deterministico,
  });

  // Resposta curta demais nao serve como system prompt: cai no deterministico.
  const texto = r.text && r.text.trim().length >= 50 ? r.text : deterministico;

  res.json({
    success: true,
    prompt: texto,
    provider: r.provider,
    ...(texto === deterministico ? { isFallback: true } : {}),
  });
});

// =========================================================================
// AZZI WHATSAPP MAGIC PHOTO DELIVERY BOT SIMULATOR
// =========================================================================
let mockOrdersWhatsApp = [
  {
    orderId: 'AZZI-WPP-7821',
    clientName: 'Mariana Duarte (Participante)',
    clientPhone: '+55 51 99876-5432',
    partName: 'Galeria Sunset Cais Embarcadeiro (6 Fotos Encontradas)',
    currentGcodeState: 'WAITING_SURVEY_COMPLETION',
    originalSpecs: {
      color: '6 fotos em Alta Resolução (4K)',
      scalePercent: 100,
      quantity: 6,
      priceBrl: 0,
      printTimeMinutes: 3,
    },
    latestAudioTranscription:
      'Oi! Quero pegar minhas fotos do Cais Embarcadeiro hoje, acabei de mandar minha selfie!',
    analyzedChanges: {
      colorChange: { from: 'Selfie Recebida', to: 'Vetor Facial Pareado com Sucesso' },
      scaleChange: { from: '6 Fotos Localizadas', to: 'Miniaturas Geradas em 1.4s' },
      timeDeltaMinutes: 0,
      newTotalPriceBrl: 0,
    },
    approvalToken: 'magic_token_azzi_wpp_7821',
    isApproved: false,
    history: [
      { timestamp: '17:40', text: 'Participante enviou selfie no WhatsApp oficial da Azzi.' },
      { timestamp: '17:41', text: 'Motor biométrico encontrou 6 fotos com 99.4% de precisão.' },
      { timestamp: '17:41', text: 'Micro-survey de 2 perguntas enviado no chat para liberar download em 4K.' },
    ],
  },
];

app.get('/api/v1/whatsapp/orders', (req, res) => {
  res.json({ success: true, orders: mockOrdersWhatsApp });
});

app.post('/api/v1/whatsapp/simulate-audio-message', async (req, res) => {
  const { audioText = 'Adorei o evento! O show de pôr do sol foi incrível e o drink da Heineken estava perfeito!' } = req.body;

  const order = mockOrdersWhatsApp[0];
  order.latestAudioTranscription = audioText;
  order.isApproved = true;
  order.currentGcodeState = 'SURVEY_COMPLETED_PHOTOS_UNLOCKED';
  order.history.push({
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    text: `Pesquisa respondida via WhatsApp: "${audioText}". Download 4K liberado e lead enriquecido no dashboard!`,
  });

  res.json({ success: true, order });
});

app.post('/api/v1/whatsapp/approve-magic-link', (req, res) => {
  const order = mockOrdersWhatsApp[0];
  order.isApproved = true;
  order.currentGcodeState = 'SURVEY_COMPLETED_PHOTOS_UNLOCKED';
  order.history.push({
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    text: 'Participante completou o micro-survey. Fotos 4K entregues com sucesso e NPS +10 registrado.',
  });

  res.json({
    success: true,
    message: 'Pesquisa concluída! Fotos em alta resolução desbloqueadas e dados sincronizados com o dashboard da Azzi.',
    order,
  });
});

// =========================================================================
// AZZI EDGE-CAMERA & WIRELESS PHOTOGRAPHER DISCOVERY
// =========================================================================
let mockDiscoveredCameras = [
  {
    id: 'CAM-SONY-A7IV-01',
    name: 'Sony Alpha A7 IV (Fotógrafo Palco Principal)',
    brand: 'Edge Sync Azzi (FTP over 5G/Wi-Fi 6)',
    ipAddress: '192.168.10.45',
    port: 21,
    protocol: 'mDNS (_azzi_camera._tcp.local)',
    macAddress: 'F4:84:4C:99:A1:4F',
    responseTimeMs: 3,
    status: 'ONLINE_READY',
    bedTemp: { current: 1420, target: 1420 }, // photos captured
    extruderTemp: { current: 99.4, target: 100 }, // accuracy %
    cameraFeedUrl: 'https://azzi.digital',
    activeFirmware: 'Azzi Edge Ingest Daemon v2.4',
  },
  {
    id: 'CAM-CANON-R6-02',
    name: 'Canon EOS R6 Mark II (Fotógrafo Área VIP)',
    brand: 'Edge Sync Azzi (FTP over 5G)',
    ipAddress: '192.168.10.88',
    port: 21,
    protocol: 'mDNS (_azzi_camera._tcp.local)',
    macAddress: '3C:E9:0E:55:B2:10',
    responseTimeMs: 6,
    status: 'PRINTING_JOB', // Ingesting active
    bedTemp: { current: 980, target: 980 },
    extruderTemp: { current: 99.7, target: 100 },
    cameraFeedUrl: 'https://azzi.digital',
    activeFirmware: 'Azzi Edge Ingest Daemon v2.4',
  },
  {
    id: 'CAM-NIKON-Z8-03',
    name: 'Nikon Z8 (Fotógrafo Estandes & Ativações)',
    brand: 'Edge Sync Azzi (FTP Local)',
    ipAddress: '192.168.10.102',
    port: 21,
    protocol: 'Subnet Port Probe (TCP 21)',
    macAddress: 'DC:A6:32:81:77:33',
    responseTimeMs: 8,
    status: 'ONLINE_IDLE',
    bedTemp: { current: 1440, target: 1440 },
    extruderTemp: { current: 99.1, target: 100 },
    cameraFeedUrl: 'https://azzi.digital',
    activeFirmware: 'Azzi Edge Ingest Daemon v2.4',
  },
];

app.post('/api/v1/network/scan-simulation', async (req, res) => {
  await new Promise((r) => setTimeout(r, 400));

  res.json({
    success: true,
    scannedSubnet: '192.168.10.0/24 (Rede do Evento)',
    scanDurationSeconds: 0.4,
    activeDevicesCount: mockDiscoveredCameras.length,
    printers: mockDiscoveredCameras,
  });
});

// Setup Vite / Static Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const p = detectProvider();
    const linha = '-'.repeat(66);
    const BREAK = String.fromCharCode(10);
    console.log(BREAK + linha);
    console.log('  AzziBrain - Motor de Ideias da Azzi');
    console.log(`  Interface:  http://localhost:${PORT}`);
    console.log(`  IA:         ${p.live ? '[OK]' : '[--]'} ${p.label}`);
    console.log(`              ${p.detail}`);
    if (p.binPath) console.log(`              binario: ${p.binPath}`);
    if (!p.live) {
      console.log('');
      console.log('  Para ligar uma IA, abra COMO-CONECTAR-IA.docx na raiz do projeto.');
      console.log('  Leva menos de 2 minutos.');
    }
    console.log(linha + BREAK);
  });
}

startServer();
