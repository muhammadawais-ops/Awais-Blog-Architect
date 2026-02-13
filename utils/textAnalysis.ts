
export const analyzeText = (text: string) => {
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
      veryHardSentences: 0,
      burstiness: 0,
      predictability: 0
    };
  }

  // ARI Readability
  const avgCharsPerWord = characters / words.length;
  const avgWordsPerSentence = words.length / sentences.length;
  const ari = 4.71 * avgCharsPerWord + 0.5 * avgWordsPerSentence - 21.43;
  let grade = Math.round(ari);
  if (grade < 1) grade = 1;

  // BURSTINESS (Variance in sentence lengths)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(sentenceLengths.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / sentenceLengths.length);
  const burstiness = Math.min(100, Math.round(stdDev * 12));

  // AI MARKERS (Predictability)
  const forbidden = [
    "let's be real", 'overall', 'furthermore', 'moreover', 'consequently', 
    'additionally', 'essential', 'crucial', 'delve', 'unlock', 
    'in conclusion', "let's explore", 'dive in', 'truth be told'
  ];
  let triggerCount = 0;
  forbidden.forEach(m => {
    const regex = new RegExp(`\\b${m}\\b`, 'gi');
    const matches = cleanContent.match(regex);
    if (matches) triggerCount += matches.length;
  });

  const predictability = Math.min(100, Math.round((triggerCount / sentences.length) * 250));

  let adverbs = 0, passiveVoice = 0, hardSentences = 0, veryHardSentences = 0;
  sentences.forEach(s => {
    const count = s.trim().split(/\s+/).length;
    if (count > 25) veryHardSentences++;
    else if (count > 15) hardSentences++;

    const passive = s.match(/\b(am|is|are|was|were|be|been|being)\b\s+([a-z]+ed|found|known|seen|taken|made)\b/gi);
    if (passive) passiveVoice += passive.length;

    const adverb = s.match(/\b(?!(only|early|likely|daily|really)\b)[a-z]+ly\b/gi);
    if (adverb) adverbs += adverb.length;
  });

  return {
    readabilityGrade: grade,
    adverbs,
    passiveVoice,
    complexPhrases: triggerCount,
    hardSentences,
    veryHardSentences,
    burstiness,
    predictability
  };
};
