
import { AnalysisMetrics } from '../types';

export const analyzeText = (text: string): AnalysisMetrics => {
  const cleanContent = text.replace(/[*#]/g, '');
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 3);
  // Fix: Explicitly type words as string[] to prevent 'never[]' inference when the array is empty,
  // which causes issues in downstream map/filter/reduce operations.
  const words: string[] = cleanContent.toLowerCase().split(/\s+/).filter(w => w.length > 0) || [];
  const charsNoSpace = cleanContent.replace(/\s+/g, '').length;
  
  if (words.length === 0 || sentences.length === 0) {
    return {
      aiScore: 0,
      perplexity: 0,
      burstiness: 0,
      syntacticComplexity: 0,
      semanticCoherence: 0,
      vocabularyDiversity: 0,
      entropy: 0,
      fleschScore: 0,
      fogIndex: 0,
      ariGrade: 0,
      avgSentenceLength: 0,
      passiveVoiceRatio: 0,
      complexWordPercentage: 0,
      adverbDensity: 0,
      hardSentences: 0,
      veryHardSentences: 0,
      wordCount: 0,
      sentenceCount: 0
    };
  }

  const wordCount = words.length;
  const sentenceCount = sentences.length;

  // --- READABILITY CALCULATIONS ---
  
  // Syllable Counter (Simplified)
  const countSyllables = (word: string) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Fix: Explicitly type the reduce accumulator as number to prevent 'never' type assignment errors
  // during calculation and ensure 'totalSyllables' is correctly typed for arithmetic operations.
  const totalSyllables = words.reduce<number>((acc, word) => acc + countSyllables(word), 0);
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;

  // Flesch Reading Ease
  const fleschScore = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (totalSyllables / wordCount));
  
  // ARI
  const ariGrade = Math.round(4.71 * (charsNoSpace / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43);
  
  // Gunning Fog
  const fogIndex = 0.4 * ((wordCount / sentenceCount) + 100 * (complexWords / wordCount));

  // --- AI MARKERS CALCULATIONS ---

  // Entropy (Character Randomness)
  const charFreq: Record<string, number> = {};
  for (const char of cleanContent) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in charFreq) {
    const p = charFreq[char] / cleanContent.length;
    entropy -= p * Math.log2(p);
  }

  // Burstiness (Length Variance)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const meanLength = wordCount / sentenceCount;
  const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - meanLength, 2), 0) / sentenceCount;
  const burstiness = Math.min(100, Math.round(Math.sqrt(variance) * 5));

  // Vocabulary Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words).size;
  const vocabularyDiversity = Math.round((uniqueWords / wordCount) * 100);

  // Perplexity Approximation (Based on bigram repetition)
  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i+1]}`);
  }
  const uniqueBigrams = new Set(bigrams).size;
  const perplexity = Math.round((uniqueBigrams / bigrams.length) * 100);

  // AI Score (Combined Heuristic)
  const aiPatterns = ["delve", "unlock", "comprehensive", "essential", "crucial", "tapestry", "moreover", "furthermore", "in conclusion", "it is important to note"];
  let patternCount = 0;
  aiPatterns.forEach(p => {
    const matches = cleanContent.match(new RegExp(`\\b${p}\\b`, 'gi'));
    if (matches) patternCount += matches.length;
  });
  
  // Refined AI Score: Lower is more Human, Higher is more AI
  // We reduce the base weights significantly to be more lenient as per user feedback
  // Lowering baseline from 25 to 15 and reducing multipliers
  const aiScore = Math.max(0, Math.min(100, Math.round(
    (15 - (burstiness / 4)) + 
    (patternCount * 1.5) + 
    (100 - vocabularyDiversity) / 5
  )));

  // Linguistic Checks
  let passiveVoice = 0, adverbs = 0, hardSentences = 0, veryHardSentences = 0;
  sentences.forEach(s => {
    const count = s.trim().split(/\s+/).length;
    if (count > 25) veryHardSentences++;
    else if (count > 15) hardSentences++;

    const passive = s.match(/\b(am|is|are|was|were|be|been|being)\b\s+([a-z]+ed|found|known|seen|taken|made)\b/gi);
    if (passive) passiveVoice += passive.length;

    const adv = s.match(/\b(?!(only|early|likely|daily|really)\b)[a-z]+ly\b/gi);
    if (adv) adverbs += adv.length;
  });

  return {
    aiScore,
    perplexity,
    burstiness,
    syntacticComplexity: Math.round((veryHardSentences / sentenceCount) * 100),
    semanticCoherence: 95, // Simulated heuristic
    vocabularyDiversity,
    entropy: Math.round(entropy * 10),
    fleschScore: Math.round(fleschScore),
    fogIndex: Math.round(fogIndex),
    ariGrade: Math.max(1, Math.round(ariGrade)),
    avgSentenceLength: Math.round(meanLength),
    passiveVoiceRatio: Math.round((passiveVoice / wordCount) * 1000),
    complexWordPercentage: Math.round((complexWords / wordCount) * 100),
    adverbDensity: Math.round((adverbs / wordCount) * 1000),
    hardSentences,
    veryHardSentences,
    wordCount,
    sentenceCount
  };
};
