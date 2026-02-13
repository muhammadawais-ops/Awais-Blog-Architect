
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
  aiScore: number; // 0 to 100 (Human likeness percentage)
  readabilityGrade: number;
  adverbs: number;
  passiveVoice: number;
  complexPhrases: number;
  hardSentences: number;
  veryHardSentences: number;
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
