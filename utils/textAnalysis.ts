
export const analyzeText = (text: string) => {
  // Deep clean to treat punctuation as sentence boundaries
  const cleanContent = text.replace(/[*#]/g, '');
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = cleanContent.toLowerCase().match(/\b(\w+)\b/g) || [];
  const characters = cleanContent.replace(/\s+/g, '').length;

  if (words.length === 0 || sentences.length === 0) {
    return {
      readabilityGrade: 0,
      adverbs: 0,
      passiveVoice: 0,
      complexPhrases: 0,
      hardSentences: 0,
      veryHardSentences: 0
    };
  }

  // Hemingway's Automated Readability Index (ARI) Approximation
  const avgCharsPerWord = characters / words.length;
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Formula: 4.71 * (chars/words) + 0.5 * (words/sentences) - 21.43
  const ari = 4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43;
  
  // Grade Floor/Ceiling to match Hemingway's UI logic
  let grade = Math.round(ari);
  if (grade < 1) grade = 1;

  let adverbs = 0;
  let passiveVoice = 0;
  let complexPhrases = 0;
  let hardSentences = 0;
  let veryHardSentences = 0;

  const complexWords = [
    'utilize', 'leverage', 'facilitate', 'subsequently', 'implementation', 
    'advantageous', 'commence', 'fundamental', 'additional', 'component'
  ];

  sentences.forEach(s => {
    const sTrim = s.trim();
    const wordList = sTrim.split(/\s+/).filter(w => w.length > 0);
    const count = wordList.length;

    // Hemingway Sentence Difficulty thresholds
    if (count > 28) veryHardSentences++;
    else if (count > 20) hardSentences++;

    // Passive voice: be-verb + past participle
    const passiveMatch = sTrim.match(/\b(am|is|are|was|were|be|been|being)\b\s+([a-z]+ed|known|seen|found|taken|given|made|done|shown|told)\b/gi);
    if (passiveMatch) passiveVoice += passiveMatch.length;

    // Adverbs ending in -ly (ignoring common words)
    const adverbMatch = sTrim.match(/\b(?!(only|early|likely|daily|apply|friendly|really)\b)[a-z]+ly\b/gi);
    if (adverbMatch) adverbs += adverbMatch.length;

    complexWords.forEach(word => {
      if (sTrim.toLowerCase().includes(word)) complexPhrases++;
    });
  });

  return {
    readabilityGrade: grade,
    adverbs,
    passiveVoice,
    complexPhrases,
    hardSentences,
    veryHardSentences
  };
};
