// Types for Azzi: Event Intelligence, Facial Recognition, High-Engagement Surveys (70%-91%), and Brand Analytics

export interface AzziEventActivation {
  eventId: string;
  eventName: string;
  partnerName: string; // e.g. "Cais Embarcadeiro", "Campus Party", "Prefeitura de Porto Alegre"
  venueLocation: string;
  totalAttendees: number;
  totalPhotosCaptured: number;
  facialMatchesDelivered: number;
  surveysCompleted: number;
  engagementRatePercent: number; // 70% to 91%
  averageSatisfactionNps: number; // e.g. +84
  sponsorImpressions: number;
  primaryMood: 'Alegria & Empolgação' | 'Engajamento Focado' | 'Surpresa Positiva' | 'Conexão de Marca';
  sponsorBooths: Array<{
    boothId: string;
    brandName: string;
    colorHex: string;
    dwellTimeMinutesAvg: number;
    leadsCaptured: number;
    costPerEngagementBrl: number;
    brandRecallPercent: number;
    optInLgpdPercent: number;
  }>;
}

export interface AzziBiometricLedgerRecord {
  recordId: string;
  timestamp: string;
  partnerSlug: string;
  eventStage: string;
  photosIndexedCount: number;
  matchLatencyMs: number; // e.g. 140ms
  faceDetectionAccuracyPercent: number; // e.g. 99.4%
  lgpdConsentMode: 'EXPLICIT_OPT_IN_ZERO_KNOWLEDGE' | 'EPHEMERAL_VECTOR_ONLY';
  encryptedEmbeddingHash: string;
  emotionsDetected: {
    joy: number; // %
    energy: number; // %
    focus: number; // %
    neutral: number; // %
  };
  status: 'SYNCHRONIZED' | 'PROCESSING_QUEUE' | 'ANONYMIZED_AFTER_DELIVERY';
}

export interface AzziSurveySentimentRecord {
  surveyId: string;
  eventName: string;
  targetAudienceSegment: string;
  triggerMoment: 'INSTANT_PHOTO_UNLOCK' | 'WHATSAPP_MAGIC_LINK' | 'LIVE_QR_INTERACTION';
  totalDispatched: number;
  totalAnswered: number;
  conversionRatePercent: number; // 70% - 91%
  averageTimeSeconds: number; // e.g. 24s
  questionsBreakdown: Array<{
    question: string;
    type: 'NPS' | 'MULTIPLE_CHOICE' | 'SENTIMENT_EMOJI' | 'BRAND_RECALL';
    topAnswer: string;
    scorePercent: number;
  }>;
  nlpSentimentSummary: {
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
    topKeywords: string[];
    actionableInsight: string;
  };
}

export interface GeneratedIdea {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category:
    | 'Reconhecimento Facial & IA'
    | 'Surveys & Engajamento 90%+'
    | 'Dashboards & ROI de Marcas'
    | 'Sentimento & Análise Emocional'
    | 'Ética, LGPD & Privacidade'
    | 'WhatsApp & Entrega Omnichannel'
    | 'Ativações em Tempo Real & Live'
    | 'CRM Pós-Evento & Monetização';
  tag: string;
  iconName: string;
  difficultyLevel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Nível Arquiteto';
  theProblem: string;
  theInnovation: string;
  theArchitecture: {
    coreModules: string[];
    techStack: string[];
    protocols: string[];
    estimatedTimeDays: number;
  };
  systemPrompt: string;
  apiEndpoints: Array<{ method: string; path: string; summary: string }>;
  impactMetric: string;
  generatedAt: string;
  aiPowered: boolean;
}
