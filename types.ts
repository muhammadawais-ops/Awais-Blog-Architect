
export type ContentType = 'blog' | 'guest_post';

export interface BlogInputs {
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  wordCount: number;
  websiteUrl: string;
  businessDetails: string;
  brandName: string;
  contentType: ContentType;
  backlinkUrl?: string;
  anchorText?: string;
  targetSiteContext?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisMetrics {
  // AI Detection Parameters
  aiScore: number;
  perplexity: number;
  burstiness: number;
  syntacticComplexity: number;
  semanticCoherence: number;
  vocabularyDiversity: number;
  entropy: number;
  
  // Readability Parameters
  fleschScore: number;
  fogIndex: number;
  ariGrade: number;
  avgSentenceLength: number;
  passiveVoiceRatio: number;
  complexWordPercentage: number;
  adverbDensity: number;
  hardSentences: number;
  veryHardSentences: number;
  wordCount: number;
  sentenceCount: number;
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
  ERROR = 'ERROR'
}

export type ViewState = 'GENERATOR';
