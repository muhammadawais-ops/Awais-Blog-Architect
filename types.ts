
export interface BlogInputs {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  wordCount: number;
  websiteUrl: string;
  businessDetails: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisMetrics {
  aiScore: number; // Originality.AI Human Score
  readabilityGrade: number;
  adverbs: number;
  passiveVoice: number;
  complexPhrases: number;
  hardSentences: number;
  veryHardSentences: number;
  burstiness: number; // Variance in sentence length
  predictability: number; // Inverse of perplexity
}

export interface GeneratedBlog {
  content: string;
  metaTitle: string;
  metaDescription: string;
  sources: GroundingSource[];
  metrics: AnalysisMetrics;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVER_BUSY = 'SERVER_BUSY'
}

export type ViewState = 'GENERATOR' | 'PRICING' | 'CHECKOUT';
