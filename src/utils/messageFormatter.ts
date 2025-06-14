
export const addEmojisToMessage = (content: string): string => {
  // Add emojis based on content context
  let formattedContent = content;

  // Health and nutrition related emojis
  const healthKeywords = [
    { keywords: ['protein', 'muscle'], emoji: '💪' },
    { keywords: ['vitamin', 'vitamins'], emoji: '🌟' },
    { keywords: ['fiber', 'digestive'], emoji: '🌾' },
    { keywords: ['calcium', 'bone'], emoji: '🦴' },
    { keywords: ['heart', 'cardiovascular'], emoji: '❤️' },
    { keywords: ['energy', 'energize'], emoji: '⚡' },
    { keywords: ['antioxidant', 'antioxidants'], emoji: '🛡️' },
    { keywords: ['hydration', 'water'], emoji: '💧' },
    { keywords: ['weight loss', 'lose weight'], emoji: '⚖️' },
    { keywords: ['exercise', 'workout'], emoji: '🏃‍♂️' },
  ];

  // Food category emojis
  const foodKeywords = [
    { keywords: ['apple', 'apples'], emoji: '🍎' },
    { keywords: ['banana', 'bananas'], emoji: '🍌' },
    { keywords: ['orange', 'oranges'], emoji: '🍊' },
    { keywords: ['carrot', 'carrots'], emoji: '🥕' },
    { keywords: ['broccoli'], emoji: '🥦' },
    { keywords: ['spinach', 'leafy greens'], emoji: '🥬' },
    { keywords: ['avocado', 'avocados'], emoji: '🥑' },
    { keywords: ['nuts', 'almonds'], emoji: '🥜' },
    { keywords: ['fish', 'salmon'], emoji: '🐟' },
    { keywords: ['chicken', 'poultry'], emoji: '🍗' },
    { keywords: ['eggs', 'egg'], emoji: '🥚' },
    { keywords: ['milk', 'dairy'], emoji: '🥛' },
    { keywords: ['bread', 'grains'], emoji: '🍞' },
    { keywords: ['rice'], emoji: '🍚' },
    { keywords: ['salad'], emoji: '🥗' },
  ];

  // Add contextual emojis
  const allKeywords = [...healthKeywords, ...foodKeywords];
  
  for (const item of allKeywords) {
    for (const keyword of item.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(formattedContent) && !formattedContent.includes(item.emoji)) {
        // Add emoji at the beginning of sentences containing the keyword
        const sentences = formattedContent.split('. ');
        const updatedSentences = sentences.map(sentence => {
          if (regex.test(sentence) && !sentence.includes(item.emoji)) {
            return `${item.emoji} ${sentence}`;
          }
          return sentence;
        });
        formattedContent = updatedSentences.join('. ');
        break; // Only add one emoji per keyword group
      }
    }
  }

  // Add greeting emojis
  if (/^(hello|hi|hey|good morning|good afternoon|good evening)/i.test(formattedContent)) {
    formattedContent = `👋 ${formattedContent}`;
  }
  
  // Add encouragement emojis
  if (/(great|excellent|good job|well done|congratulations)/i.test(formattedContent)) {
    formattedContent = `🎉 ${formattedContent}`;
  }

  return formattedContent;
};

export const isHebrew = (text: string): boolean => {
  // Check if text contains Hebrew characters
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};
