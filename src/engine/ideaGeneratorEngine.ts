import { GeneratedIdea } from '../types/innovations';

/**
 * Função de texto injetada pelo servidor. Antes este motor importava o
 * GoogleGenAI direto, o que amarrava o gerador de ideias ao Gemini. Agora ele
 * só pede "me dê texto a partir deste prompt", e quem decide se isso é Claude,
 * Gemini ou heurística é a camada src/server/aiProvider.ts.
 */
export type AiTextFn = (prompt: string, system?: string) => Promise<string>;

export type { GeneratedIdea };

export const CARDS_PER_PAGE = 20;
let activeCards: GeneratedIdea[] = [];

// Clean JSON response helper to handle markdown fences and whitespace
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Master pool of rich seed templates for Azzi:
// Startup gaúcha que transforma fotos de eventos em dados estratégicos com reconhecimento facial e surveys personalizados (70% - 91% de engajamento).
// Parceiros reais: Cais Embarcadeiro, Prefeitura de Porto Alegre, Campus Party.
export const MASTER_INNOVATION_SEEDS: Array<Omit<GeneratedIdea, 'id' | 'number' | 'generatedAt'>> = [
  {
    title: 'Desbloqueio de Foto via Selfie com Micro-Survey Instantâneo (Taxa 91%)',
    subtitle: 'Captura de dados no "Momento Mágico" quando o participante quer ver sua foto em alta resolução',
    category: 'Surveys & Engajamento 90%+',
    tag: 'Engajamento 91%',
    iconName: 'Sparkles',
    difficultyLevel: 'Iniciante',
    theProblem:
      'Pesquisas de satisfação pós-evento por e-mail ou SMS têm taxa de resposta pífia (<3%). Os organizadores perdem a chance de entender o público enquanto a experiência ainda está quente.',
    theInnovation:
      'Gatilho de Foto-Recompensa da Azzi: O participante faz upload de uma selfie para encontrar suas fotos via reconhecimento facial. Antes do download em 4K, responde a um micro-survey interativo de 2 perguntas em 15 segundos. Engajamento real validado entre 70% e 91%.',
    theArchitecture: {
      coreModules: [
        'Facial Vector Match Engine (FaceNet / InsightFace)',
        '15-Second Dynamic Micro-Survey Gatekeeper',
        'High-Res Watermark-Free Download Dispatcher',
        'Real-time Lead Enrichment & CRM Sync',
      ],
      techStack: ['Node.js / TypeScript', 'React / Tailwind', 'FastAPI Vector Search', 'PostgreSQL / Redis'],
      protocols: ['HTTPS REST', 'WebSockets', 'Vector Cosine Similarity'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI PHOTO-UNLOCK MICRO-SURVEY ENGINE (91% ENGAGEMENT)

Você é o Arquiteto de Software Principal da Azzi (https://azzi.digital), startup gaúcha pioneira em transformar fotos de eventos em inteligência de dados com reconhecimento facial e pesquisas interativas.

## 1. ESCOPO DO MÓDULO
Projetar o fluxo de alta conversão onde o participante envia sua selfie, localiza instantaneamente suas fotos no evento (ex: Cais Embarcadeiro, Campus Party) e responde a 2 perguntas estratégicas para liberar o download em alta resolução.

## 2. DIRETRIZES DE DESIGN & ARQUITETURA
- **Latência de Busca Facial**: < 300ms entre upload da selfie e exibição da galeria de miniaturas.
- **UX do Micro-Survey**: Componente fluido com botões rápidos (NPS de 1 a 10 ou carinhas de sentimento), progresso visual de 15 segundos e validação de opt-in LGPD com 1 toque.
- **Taxa de Conclusão Alvo**: 85% a 92% de conclusão antes do download.

## 3. SCHEMAS DE DADOS (TYPESCRIPT)
\`\`\`typescript
export interface PhotoUnlockSurveyPayload {
  eventId: string;
  attendeeSessionId: string;
  selfieEmbedding: number[];
  matchedPhotoIds: string[];
  surveyAnswers: Array<{
    questionId: string;
    questionText: string;
    answerValue: string | number;
    responseTimeMs: number;
  }>;
  lgpdConsent: {
    granted: boolean;
    timestamp: string;
    scope: 'PHOTO_DELIVERY_AND_SPONSOR_COMMS';
  };
}
\`\`\`

## 4. ENDPOINTS REST
- POST \`/api/v1/photos/match-selfie\` -> Retorna IDs de fotos e o micro-survey contextual do evento.
- POST \`/api/v1/surveys/submit-and-unlock\` -> Registra respostas no dashboard analítico e gera URLs assinadas temporárias para download em alta resolução.`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/photos/match-selfie', summary: 'Busca fotos pelo vetor da selfie' },
      { method: 'POST', path: '/api/v1/surveys/submit-and-unlock', summary: 'Registra survey e libera download 4K' },
      { method: 'GET', path: '/api/v1/analytics/engagement-rate', summary: 'Retorna taxa de engajamento em tempo real' },
    ],
    impactMetric: '91.2% de taxa média de resposta sem nenhum atrito',
    aiPowered: true,
  },
  {
    title: 'Heatmap de Sentimento e Humor do Público por Palco e Ativação',
    subtitle: 'Visão computacional que detecta sorrisos, empolgação e interesse genuíno nas fotos',
    category: 'Sentimento & Análise Emocional',
    tag: 'Sentimento & Mood IA',
    iconName: 'Smile',
    difficultyLevel: 'Intermediário',
    theProblem:
      'Organizadores não conseguem mensurar o impacto emocional real de um show, palestra ou estande de patrocinador, dependendo apenas de opiniões subjetivas pós-evento.',
    theInnovation:
      'Azzi Emotion Map: Processa as fotos do evento e analisa expressões faciais em escala (sorriso, euforia, atenção, neutralidade), correlacionando com horário, localização do fotógrafo e estandes de patrocinadores para gerar um mapa de calor emocional ao vivo.',
    theArchitecture: {
      coreModules: [
        'Facial Landmark & Emotion Classifier (Joy, Surprise, Attention)',
        'Stage & Sponsor Zone Geofence Mapper',
        'Timeline Sentiment Aggregator',
        'Real-time Emotion Heatmap Dashboard',
      ],
      techStack: ['Python / PyTorch', 'Node.js', 'React D3.js', 'Redis TimeSeries'],
      protocols: ['HTTPS REST', 'Server-Sent Events (SSE)'],
      estimatedTimeDays: 3,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI EVENT EMOTION & SENTIMENT HEATMAP

Você é um Engenheiro de Visão Computacional e Cientista de Dados da Azzi. Crie a arquitetura de extração de sentimento visual a partir de fotografias de multidão e retratos em eventos.

## REQUISITOS TÉCNICOS
1. Analisar landmarks faciais e classificar emoções agregadas (sem armazenar dados sensíveis de biometria individual).
2. Gerar índice de felicidade da ativação (Mood Index de 0 a 100) por estande de marca.
3. Alimentar dashboards executivos para patrocinadores do Cais Embarcadeiro e Campus Party.`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/emotions/analyze-batch', summary: 'Processa lote de fotos e extrai sentimentos' },
      { method: 'GET', path: '/api/v1/emotions/live-heatmap', summary: 'Retorna heatmap de humor por estande' },
    ],
    impactMetric: 'Mapeamento de 100% da curva emocional do público ao longo do evento',
    aiPowered: true,
  },
  {
    title: 'Cockpit de ROI de Patrocinadores: Custo por Engajamento Real (CPE)',
    subtitle: 'Painel analítico para provar a marcas exatamente quantas pessoas interagiram e converteram',
    category: 'Dashboards & ROI de Marcas',
    tag: 'Sponsor ROI Cockpit',
    iconName: 'Trophy',
    difficultyLevel: 'Iniciante',
    theProblem:
      'Patrocinadores investem dezenas de milhares de reais em eventos e recebem apenas relatórios genéricos com "estimativa visual de pessoas que passaram pelo local", sem dados de contato ou conversão.',
    theInnovation:
      'Azzi Sponsor Intelligence: Dashboard dedicado para cada marca (ex: patrocinadores de cerveja, bancos, telecomunicações) exibindo fotos com logo da marca, leads qualificados capturados nos surveys, taxa de lembrança de marca e Custo por Engajamento Real (CPE).',
    theArchitecture: {
      coreModules: [
        'Brand Logo & Backdrop Recognition Ingestion',
        'Qualified Lead Sieve with LGPD Consent Verification',
        'CPE (Cost Per Engagement) & ROI Calculator',
        'Automated Executive PDF & Executive Dashboard Generator',
      ],
      techStack: ['Node.js / Express', 'React / Recharts', 'PDFKit / Puppeteer', 'PostgreSQL'],
      protocols: ['REST API', 'HTTPS'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI SPONSOR ROI & LEAD INTELLIGENCE DASHBOARD`,
    apiEndpoints: [
      { method: 'GET', path: '/api/v1/sponsors/:sponsorId/metrics', summary: 'Retorna métricas de ROI e engajamento da marca' },
      { method: 'POST', path: '/api/v1/sponsors/export-report', summary: 'Exporta dossiê executivo com leads e métricas' },
    ],
    impactMetric: '+300% de renovação de patrocínios com dados auditáveis e precisos',
    aiPowered: false,
  },
  {
    title: 'Cofre Biométrico Ético e Criptografia LGPD Zero-Knowledge',
    subtitle: 'Vetores faciais anonimizados e exclusão programada para conformidade absoluta em eventos públicos',
    category: 'Ética, LGPD & Privacidade',
    tag: 'LGPD & Ética Biometria',
    iconName: 'ShieldAlert',
    difficultyLevel: 'Avançado',
    theProblem:
      'Eventos corporativos e órgãos públicos (como Prefeitura de Porto Alegre) exigem garantia irrestrita de conformidade com a LGPD e repudiam o armazenamento indiscriminado de biometria facial de cidadãos.',
    theInnovation:
      'Azzi Zero-Knowledge Biometric Ledger: As fotos são transformadas em embeddings matemáticos não-reversíveis criptografados. Nenhum dado biométrico cru é exposto, e o participante tem botão de 1 clique para revogar consentimento e purgar seus vetores instantaneamente.',
    theArchitecture: {
      coreModules: [
        'Non-Reversible 512-D Face Vector Hashing',
        'Zero-Knowledge Consent Registry with SHA-256 Hash',
        'Self-Service 1-Click LGPD Purge Gateway',
        'Automated Compliance Audit Trail Log',
      ],
      techStack: ['Node.js / TypeScript', 'WebCrypto API', 'PostgreSQL Audit Tables'],
      protocols: ['AES-GCM 256', 'HTTPS', 'OpenID Connect'],
      estimatedTimeDays: 3,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI LGPD ETHICAL BIOMETRIC VAULT & COMPLIANCE`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/lgpd/verify-consent', summary: 'Valida token de consentimento do participante' },
      { method: 'POST', path: '/api/v1/lgpd/purge-attendee-data', summary: 'Exclui permanentemente biometria e fotos do usuário' },
    ],
    impactMetric: '100% de conformidade com LGPD e auditoria transparente para órgãos públicos',
    aiPowered: false,
  },
  {
    title: 'WhatsApp Magic Photo Delivery Bot com Entrega em 3 Segundos',
    subtitle: 'O participante envia uma selfie no WhatsApp da Azzi e recebe todas as suas fotos do evento no chat',
    category: 'WhatsApp & Entrega Omnichannel',
    tag: 'WhatsApp Instant Delivery',
    iconName: 'MessageSquareCheck',
    difficultyLevel: 'Iniciante',
    theProblem:
      'Participantes de grandes festivais e conferências não querem baixar aplicativos pesados nem preencher cadastros longos para conseguir suas fotos.',
    theInnovation:
      'Azzi WhatsApp Express: O participante manda um "Oi" e sua selfie no WhatsApp oficial do evento. Em 3 segundos, o bot envia as fotos em prévia, aplica uma pergunta interativa e entrega o link em alta resolução. 0 downloads de apps, 100% no canal preferido do brasileiro.',
    theArchitecture: {
      coreModules: [
        'WhatsApp Cloud API / Webhook Handler',
        'Selfie Image Stream Ingestion & Vector Match',
        'Conversational 2-Step Micro-Survey Loop',
        'High-Resolution CDN CDN Photo Delivery Stream',
      ],
      techStack: ['Node.js / Express', 'Meta WhatsApp Cloud API / Baileys', 'AWS S3 / CloudFront'],
      protocols: ['HTTPS Webhooks', 'REST API'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI WHATSAPP BOT PHOTO & SURVEY DELIVERY`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/whatsapp/webhook', summary: 'Recebe selfies e mensagens dos participantes' },
      { method: 'POST', path: '/api/v1/whatsapp/send-matched-photos', summary: 'Dispara fotos e pesquisa no WhatsApp' },
    ],
    impactMetric: 'Entrega de fotos em < 3 segundos direto no WhatsApp do usuário',
    aiPowered: true,
  },
  {
    title: 'Mosaico de Fotos ao Vivo no Telão de LED da Campus Party / Cais',
    subtitle: 'Fotos dos participantes aparecem no telão formando a logo do evento conforme respondem a pesquisa',
    category: 'Ativações em Tempo Real & Live',
    tag: 'Live LED Mosaic',
    iconName: 'Layers',
    difficultyLevel: 'Intermediário',
    theProblem:
      'Telões de eventos costumam rodar vídeos institucionais estáticos que ninguém assiste, perdendo uma enorme oportunidade de gamificação do público no local.',
    theInnovation:
      'Azzi Live Interactive Mosaic: Conforme os participantes desbloqueiam suas fotos e respondem ao survey, sua foto preenche uma célula no grande mosaico digital do telão principal (formando a logo do Cais Embarcadeiro ou Campus Party), gerando efeito manada e viralização.',
    theArchitecture: {
      coreModules: [
        'Real-time WebSocket Broadcast Bus (10.000+ Conns)',
        'Canvas Tile Layout Grid & Logo Mask Blending',
        'Content Moderation & NSFW Filter Gatekeeper',
        'Ultra-Low Latency LED Screen Client (WebGL)',
      ],
      techStack: ['React / Three.js Canvas', 'Node.js / ws', 'Redis PubSub'],
      protocols: ['WebSockets (WSS)', 'WebGL'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI LIVE LED SCREEN MOSAIC & GAMIFICATION ENGINE`,
    apiEndpoints: [
      { method: 'GET', path: '/api/v1/live/mosaic-stream', summary: 'Stream WebSocket de fotos para o telão' },
      { method: 'POST', path: '/api/v1/live/moderate-photo', summary: 'Aprova ou oculta foto do telão' },
    ],
    impactMetric: '+400% de adesão espontânea ao survey estimulada pelo telão ao vivo',
    aiPowered: false,
  },
  {
    title: 'Enriquecimento de Leads com Dados Demográficos Estimados por IA',
    subtitle: 'Estimativa anônima de faixa etária e perfil para enriquecer a base de CRM dos organizadores',
    category: 'CRM Pós-Evento & Monetização',
    tag: 'Smart Lead Enrichment',
    iconName: 'Zap',
    difficultyLevel: 'Intermediário',
    theProblem:
      'Bases de contatos capturadas em eventos contêm apenas nome e e-mail, sem dados de segmentação demográfica, dificultando campanhas de marketing direcionadas.',
    theInnovation:
      'Azzi Demographic & Interest Synthesizer: Ao associar a foto com as respostas da pesquisa, a IA estima anonimamente a faixa etária (ex: 25-34 anos) e o cluster de interesses do participante (ex: Tech Lover, Gastronomia, Família), gerando tags de CRM prontas para exportar no HubSpot/RD Station.',
    theArchitecture: {
      coreModules: [
        'Demographic Cluster Estimator',
        'Survey Response Cross-Matcher',
        'HubSpot / RD Station CRM Webhook Connector',
        'Segment Performance Analyzer',
      ],
      techStack: ['Node.js', 'Python FastAPI', 'HubSpot API / RD Station API'],
      protocols: ['REST', 'OAuth2 Webhooks'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI SMART CRM ENRICHMENT & DEMOGRAPHIC CLUSTERING`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/crm/enrich-attendee', summary: 'Gera tags de cluster e enriquece lead' },
      { method: 'POST', path: '/api/v1/crm/sync-hubspot', summary: 'Exporta leads segmentados para o CRM do cliente' },
    ],
    impactMetric: '+65% de conversão nas campanhas de e-mail marketing pós-evento',
    aiPowered: true,
  },
  {
    title: 'Edge-Camera Sync: Upload sem Fio dos Fotógrafos com Indexação Instantânea',
    subtitle: 'Fotógrafos sobem fotos direto da câmera profissional via Wi-Fi/FTP sem precisar descarregar cartão SD',
    category: 'Reconhecimento Facial & IA',
    tag: 'Edge Camera Sync',
    iconName: 'Radio',
    difficultyLevel: 'Avançado',
    theProblem:
      'Fotógrafos só descarregam os cartões SD horas depois do evento ou no dia seguinte, perdendo o momento crucial em que o público quer postar fotos nas redes sociais com a hashtag do evento.',
    theInnovation:
      'Azzi Instant Ingest Station: Conecta câmeras Sony/Canon/Nikon via Wi-Fi local ou 5G direto ao servidor de borda da Azzi. Assim que o clique é feito, a foto é indexada pelo reconhecimento facial em 1.5 segundos e disponibilizada para busca.',
    theArchitecture: {
      coreModules: [
        'FTP / SFTP Edge Listener Daemon',
        'Auto EXIF & Color Profile Normalize Pipeline',
        'High-Throughput Face Vector Extraction Queue',
        'Instant CDN Thumbnail Broadcaster',
      ],
      techStack: ['Node.js', 'Sharp Image Pipeline', 'BullMQ / Redis', 'TensorRT'],
      protocols: ['FTP / FTPS', 'TCP Sockets', 'REST API'],
      estimatedTimeDays: 3,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI REAL-TIME WIRELESS CAMERA INGEST & VECTOR INDEXER`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/ingest/ftp-webhook', summary: 'Recebe nova foto do fotógrafo em tempo real' },
      { method: 'GET', path: '/api/v1/ingest/queue-stats', summary: 'Monitora velocidade de indexação das fotos' },
    ],
    impactMetric: 'Fotos disponíveis para o público em menos de 10 segundos após o clique do fotógrafo',
    aiPowered: true,
  },
  {
    title: 'Survey Gamificado com Roleta de Prêmios e Cupons Desbloqueados',
    subtitle: 'Aumente o engajamento de 70% para 95% oferecendo recompensas imediatas dos patrocinadores',
    category: 'Surveys & Engajamento 90%+',
    tag: 'Gamificação & Cupons',
    iconName: 'Trophy',
    difficultyLevel: 'Iniciante',
    theProblem:
      'Em eventos de grande porte com público jovem (como festivais e Campus Party), incentivos puramente passivos podem deixar alguns participantes desinteressados.',
    theInnovation:
      'Azzi Lucky Wheel & Sponsor Coupons: Após responder ao micro-survey de 2 perguntas, o participante ganha 1 giro numa roleta digital ou recebe um voucher exclusivo com QR Code de um patrocinador (ex: drink cortesia no Cais Embarcadeiro, brinde no stand).',
    theArchitecture: {
      coreModules: [
        'Wheel Probability Engine with Anti-Fraud Checks',
        'Sponsor Voucher QR Code Synthesizer',
        'Redemption Validation Mobile Scanner for Booths',
      ],
      techStack: ['React Canvas', 'Node.js / Express', 'QRCode Generator'],
      protocols: ['REST API', 'HTTPS'],
      estimatedTimeDays: 1,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI GAMIFIED SURVEY REWARD & SPONSOR VOUCHER ENGINE`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/gamification/spin-reward', summary: 'Gera recompensa do survey' },
      { method: 'POST', path: '/api/v1/gamification/redeem-voucher', summary: 'Valida resgate no estande do patrocinador' },
    ],
    impactMetric: '94.8% de engajamento e fluxo direto de público para estandes parceiros',
    aiPowered: false,
  },
  {
    title: 'NPS em Tempo Real por Hora e por Zona do Evento',
    subtitle: 'Descubra filas, problemas de som ou banheiros antes que os participantes reclamem nas redes',
    category: 'Dashboards & ROI de Marcas',
    tag: 'NPS em Tempo Real',
    iconName: 'FileCode',
    difficultyLevel: 'Iniciante',
    theProblem:
      'Organizadores só descobrem que o ar-condicionado falhou ou que a fila de bebidas demorava 40 minutos quando o evento acaba e as críticas inundam as redes sociais.',
    theInnovation:
      'Azzi Live Pulse: Painel de alertas instantâneos que analisa o NPS e comentários dos micro-surveys hora a hora. Se o índice de satisfação na área gastronômica cair 15%, o coordenador de operações recebe um alerta imediato no WhatsApp com a causa exata.',
    theArchitecture: {
      coreModules: [
        'Real-time NPS Sliding Window Aggregator',
        'NLP Fast Keyword Alert Trigger (ex: "fila", "som", "calor")',
        'Coordinator WhatsApp Urgent Alert Dispatcher',
      ],
      techStack: ['Node.js', 'Express', 'Redis TimeSeries', 'WhatsApp API'],
      protocols: ['REST API', 'SSE'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI REAL-TIME NPS PULSE & ANOMALY ALERT ENGINE`,
    apiEndpoints: [
      { method: 'GET', path: '/api/v1/analytics/hourly-nps', summary: 'Retorna série temporal de NPS por hora' },
      { method: 'POST', path: '/api/v1/analytics/trigger-ops-alert', summary: 'Dispara alerta de anomalia no evento' },
    ],
    impactMetric: 'Resolução de problemas operacionais em menos de 15 minutos durante o evento',
    aiPowered: false,
  },
  {
    title: 'Re-Engajamento D+1 e D+7: Álbum de Memórias com Oferta Personalizada',
    subtitle: 'Transforme a memória afetiva do evento em vendas e fidelização contínua de clientes',
    category: 'CRM Pós-Evento & Monetização',
    tag: 'Pós-Evento D+1/D+7',
    iconName: 'MessageSquare',
    difficultyLevel: 'Iniciante',
    theProblem:
      'O evento termina no domingo e na segunda-feira o canal com o participante esfria completamente, sem nenhum follow-up qualificado ou geração de receita residual.',
    theInnovation:
      'Azzi Memory Loop: No dia seguinte, envia um resumo visual ("Você no Cais Embarcadeiro") com fotos dos melhores momentos, feedback consolidado e convite exclusivo para a próxima edição ou compra de ingressos antecipados com desconto.',
    theArchitecture: {
      coreModules: [
        'Personalized Memory Card Generator (Canvas / SVG)',
        'D+1 & D+7 Automated Nurturing Scheduler',
        'Ticket Conversion & Next Event Tracking Linker',
      ],
      techStack: ['Node.js / Express', 'BullMQ Cron Jobs', 'WhatsApp / SendGrid API'],
      protocols: ['HTTPS REST'],
      estimatedTimeDays: 1,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI POST-EVENT MEMORY & RE-ENGAGEMENT LOOP`,
    apiEndpoints: [
      { method: 'POST', path: '/api/v1/nurturing/schedule-batch', summary: 'Agenda mensagens de follow-up pós-evento' },
      { method: 'GET', path: '/api/v1/nurturing/conversion-stats', summary: 'Mede conversão de ingressos da próxima edição' },
    ],
    impactMetric: '+28% de vendas antecipadas de ingressos para a edição seguinte',
    aiPowered: false,
  },
  {
    title: 'Auditoria de Circulação de Cidadãos e Impacto Urbano para Prefeituras',
    subtitle: 'Relatório estruturado de impacto econômico e demográfico para eventos da Prefeitura de Porto Alegre',
    category: 'Ética, LGPD & Privacidade',
    tag: 'Prefeitura & Cidades Inteligentes',
    iconName: 'Cpu',
    difficultyLevel: 'Intermediário',
    theProblem:
      'Prefeituras e órgãos públicos investem recursos em eventos culturais e festivais de rua, mas têm dificuldade de comprovar o retorno social, a origem do público e o engajamento comunitário.',
    theInnovation:
      'Azzi Civic Insights: Gera relatórios executivos para secretarias municipais (ex: Turismo, Desenvolvimento Econômico e Cultura de Porto Alegre) demonstrando fluxo de cidadãos, satisfação com serviços públicos e impacto no comércio local, com dados 100% anonimizados.',
    theArchitecture: {
      coreModules: [
        'Civic Demographic & Geographic Aggregator',
        'Public Service Satisfaction Scoring Matrix',
        'Economic Spillover Calculator for Local Businesses',
        'Auditable Open-Data Compliance Export',
      ],
      techStack: ['Node.js / TypeScript', 'PostgreSQL', 'React D3.js', 'PDFKit'],
      protocols: ['REST API', 'HTTPS'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: AZZI CIVIC & PUBLIC SECTOR EVENT INTELLIGENCE`,
    apiEndpoints: [
      { method: 'GET', path: '/api/v1/civic/city-report', summary: 'Gera relatório de impacto municipal' },
      { method: 'POST', path: '/api/v1/civic/export-audit', summary: 'Exporta dados anonimizados para auditoria pública' },
    ],
    impactMetric: 'Prestação de contas 100% fundamentada em dados reais de cidadãos',
    aiPowered: true,
  },
];

// In-memory set of seen titles / IDs to guarantee no repeats across generations
const seenIdeaTitles = new Set<string>();

// Dynamic algorithmic procedural generator for endless combinatoric Azzi event intelligence innovations
function generateProceduralInnovation(
  index: number,
  excludedTitles: string[] = []
): GeneratedIdea {
  const excludedSet = new Set(excludedTitles.map((t) => t.toLowerCase()));

  const prefixes = [
    'O Motor Inteligente de',
    'A Central Estratégica de',
    'O Assistente Automático de',
    'O Módulo de Alta Conversão para',
    'O Painel em Tempo Real de',
    'O Otimizador de Reconhecimento para',
    'O Integrador Omnichannel de',
    'O Algoritmo Preditivo de',
    'A Esteira de Ingestão de',
    'O Coletor Gamificado de',
    'O Inspetor de Sentimento para',
    'O Cofre de Privacidade para',
    'O Roteador de Fotos para',
    'O Gerador de Dossiês de',
    'O Bot Conversacional de',
    'O Radar de Engajamento para',
  ];

  const subjects = [
    'Reconhecimento Facial em Festivais Noturnos com Pouca Luz',
    'Micro-Surveys Personalizados por Tipo de Ingresso VIP e Pista',
    'Relatórios de Lembrete de Marca para Patrocinadores do Cais',
    'Entrega Instantânea de Fotos no WhatsApp sem Fila',
    'Mosaico de Fotos Colaborativo em Telões da Campus Party',
    'Análise de Expressões de Alegria e Empolgação no Show',
    'Enriquecimento de Leads com Segmentação Demográfica por IA',
    'Sorteios e Cupons de Desconto Desbloqueados após Pesquisa',
    'Conformidade LGPD com Exclusão Automática de Vetores Faciais',
    'Detecção de Horários de Pico e Gargalos de Circulação',
    'Re-Engajamento Afetivo D+1 com Álbum de Recordações',
    'Upload sem Fio e Indexação em 1.5s das Câmeras dos Fotógrafos',
    'Métricas de Custo por Engajamento Real (CPE) para Marcas',
    'Pesquisa de Satisfação Cidadã para Eventos Públicos de POA',
    'Avaliação de Estandes e Ativações Interativas de Patrocínio',
    'Captura de Feedbacks Espontâneos com IA de Áudio e Texto',
  ];

  const categories: GeneratedIdea['category'][] = [
    'Reconhecimento Facial & IA',
    'Surveys & Engajamento 90%+',
    'Dashboards & ROI de Marcas',
    'Sentimento & Análise Emocional',
    'Ética, LGPD & Privacidade',
    'WhatsApp & Entrega Omnichannel',
    'Ativações em Tempo Real & Live',
    'CRM Pós-Evento & Monetização',
  ];

  const icons = [
    'Sparkles',
    'Smile',
    'Trophy',
    'ShieldAlert',
    'MessageSquareCheck',
    'Layers',
    'Zap',
    'Radio',
    'Cpu',
    'FileCode',
    'MessageSquare',
  ];

  for (let attempt = 0; attempt < 50; attempt++) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = subjects[Math.floor(Math.random() * subjects.length)];
    const title = `${p} ${s}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const iconName = icons[Math.floor(Math.random() * icons.length)];

    if (!excludedSet.has(title.toLowerCase()) && !seenIdeaTitles.has(title.toLowerCase())) {
      seenIdeaTitles.add(title.toLowerCase());

      return {
        id: `IDEA-AZZI-PROC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        number: index + 1,
        title,
        subtitle: `Solução inovadora da Azzi para ${s.toLowerCase()} com foco em alta performance e ética`,
        category,
        tag: 'Inovação Azzi Digital',
        iconName,
        difficultyLevel: 'Intermediário',
        theProblem: `Organizadores e patrocinadores enfrentam falta de dados precisos e baixa taxa de engajamento ao tentar mensurar ${s.toLowerCase()}.`,
        theInnovation: `Tecnologia proprietária da Azzi que une reconhecimento facial instantâneo, pesquisas fluidas (70%-91% resposta) e inteligência analítica em dashboards estratégicos.`,
        theArchitecture: {
          coreModules: [
            'Azzi Vector & Face Recognition Pipeline',
            'Dynamic Micro-Survey Engine (70%-91% completion)',
            'Real-Time Brand Analytics & Sponsor Dashboard',
            'LGPD Zero-Knowledge Cryptographic Vault',
          ],
          techStack: ['Node.js / TypeScript', 'React / Tailwind', 'FastAPI / PyTorch', 'PostgreSQL / Redis'],
          protocols: ['REST API', 'WebSockets', 'HTTPS'],
          estimatedTimeDays: 2,
        },
        systemPrompt: `# SYSTEM PROMPT: ${title.toUpperCase()} (AZZI EVENT INTELLIGENCE)

Você é o Arquiteto de Software e Estrategista de Dados da Azzi (https://azzi.digital).

Desenvolva o módulo para ${title}.
Requisitos:
1. Maximizar a taxa de engajamento do público (70% a 91%).
2. Proteger dados pessoais com conformidade estrita com a LGPD.
3. Gerar métricas acionáveis e auditáveis para organizadores e marcas patrocinadoras (ex: Cais Embarcadeiro, Campus Party, Prefeitura de Porto Alegre).`,
        apiEndpoints: [
          { method: 'POST', path: '/api/v1/azzi/execute', summary: `Executa processamento para ${s}` },
          { method: 'GET', path: '/api/v1/azzi/analytics', summary: 'Retorna métricas consolidadas de engajamento' },
        ],
        impactMetric: '+85% de taxa de engajamento e dados estratégicos em tempo real',
        generatedAt: new Date().toISOString(),
        aiPowered: false,
      };
    }
  }

  // Fallback unique idea
  const fallbackTitle = `Módulo Estratégico de ${subjects[index % subjects.length]}`;
  return {
    id: `IDEA-AZZI-FALLBACK-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    number: index + 1,
    title: fallbackTitle,
    subtitle: 'Inteligência de eventos e reconhecimento facial de alta precisão',
    category: categories[index % categories.length],
    tag: 'Azzi Core Innovation',
    iconName: 'Zap',
    difficultyLevel: 'Intermediário',
    theProblem: 'Processos desconectados de captura de fotos e feedback de público geram perda de oportunidades para marcas.',
    theInnovation: 'Fluxo unificado da Azzi que transforma cada foto tirada em inteligência estratégica e dados de valor.',
    theArchitecture: {
      coreModules: ['Facial Ingestion', 'Survey Gatekeeper', 'Sponsor Analytics'],
      techStack: ['Node.js', 'React', 'TypeScript', 'PostgreSQL'],
      protocols: ['REST', 'HTTPS'],
      estimatedTimeDays: 2,
    },
    systemPrompt: `# SYSTEM PROMPT: ${fallbackTitle.toUpperCase()}\n\nDesenvolva uma ferramenta inovadora para a plataforma Azzi.`,
    apiEndpoints: [{ method: 'GET', path: '/api/v1/status', summary: 'Status da ferramenta' }],
    impactMetric: 'Decisões mais inteligentes baseadas em dados reais de público',
    generatedAt: new Date().toISOString(),
    aiPowered: false,
  };
}

export function initializeInitialCards(excludedTitles: string[] = []): GeneratedIdea[] {
  const excludedSet = new Set(excludedTitles.map((t) => t.toLowerCase()));

  const availableSeeds = MASTER_INNOVATION_SEEDS.filter(
    (seed) => !excludedSet.has(seed.title.toLowerCase())
  );

  activeCards = [];

  for (let i = 0; i < CARDS_PER_PAGE; i++) {
    if (i < availableSeeds.length) {
      const seed = availableSeeds[i];
      seenIdeaTitles.add(seed.title.toLowerCase());
      activeCards.push({
        ...seed,
        id: `IDEA-INIT-${i + 1}-${Date.now().toString(36)}`,
        number: i + 1,
        generatedAt: new Date().toISOString(),
      });
    } else {
      const proc = generateProceduralInnovation(i, [
        ...excludedTitles,
        ...activeCards.map((c) => c.title),
      ]);
      activeCards.push(proc);
    }
  }

  return activeCards;
}

export function getActiveCards(excludedTitles: string[] = []): GeneratedIdea[] {
  if (activeCards.length < CARDS_PER_PAGE) {
    return initializeInitialCards(excludedTitles);
  }

  const excludedSet = new Set(excludedTitles.map((t) => t.toLowerCase()));

  for (let i = 0; i < activeCards.length; i++) {
    if (excludedSet.has(activeCards[i].title.toLowerCase())) {
      const existingTitles = [
        ...excludedTitles,
        ...activeCards.map((c) => c.title),
      ];
      activeCards[i] = generateProceduralInnovation(i, existingTitles);
    }
  }

  return activeCards;
}

// Generate a brand new, never-repeated idea for a specific card index
export async function regenerateCardAtIndex(
  cardIndex: number,
  generateText: AiTextFn | null,
  excludedTitles: string[] = []
): Promise<{ success: boolean; idea: GeneratedIdea; cardIndex: number }> {
  if (cardIndex < 0 || cardIndex >= CARDS_PER_PAGE) cardIndex = 0;

  const combinedExcluded = [
    ...excludedTitles,
    ...activeCards.map((c) => c.title),
    ...Array.from(seenIdeaTitles),
  ];

  // 1. Try AI-Powered Generation first if any provider is bound
  if (generateText) {
    try {
      const categories: GeneratedIdea['category'][] = [
        'Reconhecimento Facial & IA',
        'Surveys & Engajamento 90%+',
        'Dashboards & ROI de Marcas',
        'Sentimento & Análise Emocional',
        'Ética, LGPD & Privacidade',
        'WhatsApp & Entrega Omnichannel',
        'Ativações em Tempo Real & Live',
        'CRM Pós-Evento & Monetização',
      ];
      const targetCategory = categories[Math.floor(Math.random() * categories.length)];
      const sampleExcluded = combinedExcluded.slice(0, 15).join('; ');

      const prompt = `Você é o Arquiteto de Software e Estrategista de Inovação da AZZI (https://azzi.digital).
Azzi é uma startup gaúcha que transforma fotos de eventos em dados estratégicos. Utilizamos reconhecimento facial e surveys personalizados para extrair informações valiosas do público, com taxas médias de engajamento entre 70% e 91%.
Nossa tecnologia permite que marcas e organizadores entendam quem participou, como interagiu e o que sentiu — tudo isso por meio de dashboards e relatórios analíticos.
Parceiros: Cais Embarcadeiro, Prefeitura de Porto Alegre, Campus Party. Slogan: "Transformamos cliques em decisões mais inteligentes".

Gere 1 (UMA) ideia de produto, funcionalidade ou inovação estratégica de software inédita para o negócio da AZZI.

NÃO repita nenhuma das seguintes ideias já existentes: [${sampleExcluded}].
Categoria recomendada: ${targetCategory}.

Retorne ESTRITAMENTE em formato JSON (sem markdown fences extras):
{
  "title": "Título marcante e executivo (Ex: Algoritmo de... / Cockpit de... / O Módulo de...)",
  "subtitle": "Subtítulo de 1 linha explicando como resolve a dor do organizador ou patrocinador",
  "category": "${targetCategory}",
  "tag": "Nome curto da funcionalidade",
  "iconName": "Sparkles | Smile | Trophy | ShieldAlert | MessageSquareCheck | Layers | Zap | Radio | Cpu | FileCode | MessageSquare",
  "difficultyLevel": "Iniciante" | "Intermediário" | "Avançado",
  "theProblem": "Descrição clara e realista do problema no mercado de eventos/marcas (2 frases)",
  "theInnovation": "Descrição clara da solução inovadora da Azzi (2 frases)",
  "theArchitecture": {
    "coreModules": ["Módulo 1", "Módulo 2", "Módulo 3"],
    "techStack": ["Node.js", "React", "Tailwind CSS", "FastAPI"],
    "protocols": ["REST API", "HTTPS", "WebSockets"],
    "estimatedTimeDays": 2
  },
  "systemPrompt": "System Prompt estruturado e profissional para implementação do módulo",
  "apiEndpoints": [
    { "method": "POST", "path": "/api/v1/...", "summary": "Descrição da rota" },
    { "method": "GET", "path": "/api/v1/...", "summary": "Descrição da rota" }
  ],
  "impactMetric": "Frase de impacto real (Ex: +85% de engajamento / Zero risco LGPD)"
}`;

      let responseText = '';
      try {
        responseText = await generateText(
          prompt,
          'Você é o Especialista em Inteligência de Eventos, Reconhecimento Facial e Surveys da startup Azzi. Retorne SEMPRE um JSON válido, sem texto fora do JSON.'
        );
      } catch (aiErr: any) {
        console.warn('[AzziBrain] geração de card por IA falhou:', aiErr?.message);
      }

      if (responseText) {
        const cleanedJson = cleanJsonString(responseText);
        const parsed = JSON.parse(cleanedJson);

        const newIdea: GeneratedIdea = {
          id: `IDEA-AZZI-AI-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          number: cardIndex + 1,
          title: parsed.title || 'Módulo Estratégico Azzi Analytics',
          subtitle: parsed.subtitle || 'Transformando fotos de eventos em decisões inteligentes',
          category: parsed.category || targetCategory,
          tag: parsed.tag || 'Inovação Azzi',
          iconName: parsed.iconName || 'Sparkles',
          difficultyLevel: parsed.difficultyLevel || 'Intermediário',
          theProblem: parsed.theProblem || 'Falta de dados e métricas reais em eventos.',
          theInnovation: parsed.theInnovation || 'Reconhecimento facial com micro-surveys de 70%-91% engajamento.',
          theArchitecture: parsed.theArchitecture || {
            coreModules: ['Facial Vector Engine', 'Survey Gatekeeper', 'Sponsor ROI Dashboard'],
            techStack: ['Node.js', 'React', 'TypeScript', 'Tailwind'],
            protocols: ['REST', 'HTTPS'],
            estimatedTimeDays: 2,
          },
          systemPrompt: parsed.systemPrompt || `# SYSTEM PROMPT\n\nDesenvolva o módulo para ${parsed.title}.`,
          apiEndpoints: parsed.apiEndpoints || [
            { method: 'GET', path: '/api/v1/status', summary: 'Verifica status do módulo' },
          ],
          impactMetric: parsed.impactMetric || 'Taxa de engajamento acima de 85%',
          generatedAt: new Date().toISOString(),
          aiPowered: true,
        };

        activeCards[cardIndex] = newIdea;
        seenIdeaTitles.add(newIdea.title.toLowerCase());

        return { success: true, idea: newIdea, cardIndex };
      }
    } catch (err) {
      console.warn('Fallback to procedural generator due to JSON/AI error:', err);
    }
  }

  // 2. Fallback to Master Seeds that haven't been used yet
  const excludedSet = new Set(combinedExcluded.map((t) => t.toLowerCase()));
  const candidateSeeds = MASTER_INNOVATION_SEEDS.filter(
    (s) => !excludedSet.has(s.title.toLowerCase())
  );

  let chosenIdea: GeneratedIdea;

  if (candidateSeeds.length > 0) {
    const chosenSeed = candidateSeeds[Math.floor(Math.random() * candidateSeeds.length)];
    chosenIdea = {
      ...chosenSeed,
      id: `IDEA-AZZI-SEED-${cardIndex + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      number: cardIndex + 1,
      generatedAt: new Date().toISOString(),
    };
  } else {
    // 3. Fallback to Procedural Combinatorial Generator
    chosenIdea = generateProceduralInnovation(cardIndex, combinedExcluded);
  }

  activeCards[cardIndex] = chosenIdea;
  seenIdeaTitles.add(chosenIdea.title.toLowerCase());

  return { success: true, idea: chosenIdea, cardIndex };
}

// Fast parallel regeneration of all 20 cards
export async function regenerateAllCards(
  generateText: AiTextFn | null,
  excludedTitles: string[] = []
): Promise<GeneratedIdea[]> {
  const currentExcluded = [...excludedTitles];

  if (generateText) {
    try {
      const prompt = `Gere uma lista JSON contendo 6 (SEIS) ideias de inovações estratégicas inéditas para a AZZI (startup gaúcha que transforma fotos de eventos em dados estratégicos via reconhecimento facial e surveys com 70% a 91% de engajamento - Cais Embarcadeiro, Campus Party, Prefeitura de Porto Alegre).
Cada ideia deve ter formato estrito:
[
  {
    "title": "Título inovador e profissional",
    "subtitle": "Subtítulo explicativo em 1 linha",
    "category": "Reconhecimento Facial & IA" | "Surveys & Engajamento 90%+" | "Dashboards & ROI de Marcas" | "Sentimento & Análise Emocional" | "Ética, LGPD & Privacidade" | "WhatsApp & Entrega Omnichannel" | "Ativações em Tempo Real & Live" | "CRM Pós-Evento & Monetização",
    "tag": "Nome da Inovação",
    "iconName": "Sparkles" | "Smile" | "Trophy" | "ShieldAlert" | "MessageSquareCheck" | "Layers" | "Zap",
    "difficultyLevel": "Iniciante" | "Intermediário" | "Avançado",
    "theProblem": "Descrição da dor no mercado de eventos ou marcas",
    "theInnovation": "Solução com IA da Azzi",
    "theArchitecture": {
      "coreModules": ["Módulo 1", "Módulo 2"],
      "techStack": ["Node.js", "React", "TypeScript", "Tailwind"],
      "protocols": ["REST", "HTTPS"],
      "estimatedTimeDays": 2
    },
    "systemPrompt": "# SYSTEM PROMPT...",
    "apiEndpoints": [{ "method": "POST", "path": "/api/v1/...", "summary": "..." }],
    "impactMetric": "+88% de engajamento comprovado"
  }
]`;

      const resText = await generateText(
        prompt,
        'Retorne estritamente um array JSON com as ideias solicitadas para a Azzi, sem texto fora do JSON.'
      );

      if (resText) {
        const cleaned = cleanJsonString(resText);
        const parsedArray: any[] = JSON.parse(cleaned);

        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          parsedArray.forEach((item, idx) => {
            if (idx < CARDS_PER_PAGE) {
              const aiIdea: GeneratedIdea = {
                id: `IDEA-AZZI-BATCH-${Date.now().toString(36)}-${idx}`,
                number: idx + 1,
                title: item.title || `Inovação Azzi #${idx + 1}`,
                subtitle: item.subtitle || 'Inteligência de eventos e reconhecimento facial',
                category: item.category || 'Surveys & Engajamento 90%+',
                tag: item.tag || 'Inovação Azzi',
                iconName: item.iconName || 'Sparkles',
                difficultyLevel: item.difficultyLevel || 'Intermediário',
                theProblem: item.theProblem || 'Desafio de métricas em eventos.',
                theInnovation: item.theInnovation || 'Solução inteligente Azzi.',
                theArchitecture: item.theArchitecture || {
                  coreModules: ['Core Ingestion', 'Survey Gateway'],
                  techStack: ['Node.js', 'Express', 'React'],
                  protocols: ['REST'],
                  estimatedTimeDays: 2,
                },
                systemPrompt: item.systemPrompt || `# SYSTEM PROMPT\n\nDesenvolva o módulo para ${item.title}.`,
                apiEndpoints: item.apiEndpoints || [{ method: 'GET', path: '/api/v1/status', summary: 'Status' }],
                impactMetric: item.impactMetric || 'Taxa de resposta de 90%',
                generatedAt: new Date().toISOString(),
                aiPowered: true,
              };

              activeCards[idx] = aiIdea;
              currentExcluded.push(aiIdea.title);
              seenIdeaTitles.add(aiIdea.title.toLowerCase());
            }
          });
        }
      }
    } catch (batchErr) {
      console.warn('Batch AI generation failed, falling back to procedural seeds:', batchErr);
    }
  }

  // Fill remaining slots up to 20 with fresh seeds and procedural matrix
  const excludedSet = new Set(currentExcluded.map((t) => t.toLowerCase()));
  const availableSeeds = MASTER_INNOVATION_SEEDS.filter(
    (s) => !excludedSet.has(s.title.toLowerCase())
  );

  let seedIdx = 0;
  for (let i = 0; i < CARDS_PER_PAGE; i++) {
    if (!activeCards[i] || activeCards.length < CARDS_PER_PAGE || activeCards[i].generatedAt < new Date(Date.now() - 5000).toISOString()) {
      if (seedIdx < availableSeeds.length) {
        const seed = availableSeeds[seedIdx++];
        activeCards[i] = {
          ...seed,
          id: `IDEA-AZZI-REGEN-${i + 1}-${Date.now().toString(36)}`,
          number: i + 1,
          generatedAt: new Date().toISOString(),
        };
        excludedSet.add(seed.title.toLowerCase());
        seenIdeaTitles.add(seed.title.toLowerCase());
      } else {
        const proc = generateProceduralInnovation(i, Array.from(excludedSet));
        activeCards[i] = proc;
        excludedSet.add(proc.title.toLowerCase());
        seenIdeaTitles.add(proc.title.toLowerCase());
      }
    }
  }

  return activeCards;
}
