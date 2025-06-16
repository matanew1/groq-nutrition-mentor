export const addEmojisToMessage = (content: string): string => {
  // Add emojis based on content context
  let formattedContent = content;

  // Health and nutrition related emojis
  const healthKeywords = [
    { keywords: ['protein', 'muscle', 'חלבון', 'שריר'], emoji: '💪' },
    { keywords: ['vitamin', 'vitamins', 'ויטמין', 'ויטמינים'], emoji: '🌟' },
    { keywords: ['fiber', 'digestive', 'סיבים', 'עיכול'], emoji: '🌾' },
    { keywords: ['calcium', 'bone', 'סידן', 'עצם', 'עצמות'], emoji: '🦴' },
    { keywords: ['heart', 'cardiovascular', 'לב', 'קרדיווסקולרי'], emoji: '❤️' },
    { keywords: ['energy', 'energize', 'אנרגיה', 'מרץ'], emoji: '⚡' },
    { keywords: ['antioxidant', 'antioxidants', 'נוגד חמצון', 'נוגדי חמצון'], emoji: '🛡️' },
    { keywords: ['hydration', 'water', 'הידרציה', 'מים', 'שתייה'], emoji: '💧' },
    { keywords: ['weight loss', 'lose weight', 'ירידה במשקל', 'לרזות', 'דיאטה'], emoji: '⚖️' },
    { keywords: ['exercise', 'workout', 'פעילות גופנית', 'אימון', 'כושר'], emoji: '🏃‍♂️' },
    { keywords: ['blood sugar', 'glucose', 'סוכר בדם', 'גלוקוז', 'סוכרת'], emoji: '📊' },
    { keywords: ['immune', 'immunity', 'חיסוני', 'מערכת חיסון'], emoji: '🛡️' },
    { keywords: ['inflammation', 'דלקת', 'נפיחות'], emoji: '🔥' },
  ];

  // Food category emojis with Hebrew keywords
  const foodKeywords = [
    { keywords: ['apple', 'apples', 'תפוח', 'תפוחים'], emoji: '🍎' },
    { keywords: ['banana', 'bananas', 'בננה', 'בננות'], emoji: '🍌' },
    { keywords: ['orange', 'oranges', 'תפוז', 'תפוזים'], emoji: '🍊' },
    { keywords: ['carrot', 'carrots', 'גזר', 'גזרים'], emoji: '🥕' },
    { keywords: ['broccoli', 'ברוקולי'], emoji: '🥦' },
    { keywords: ['spinach', 'leafy greens', 'תרד', 'ירקות עליים', 'עלים ירוקים'], emoji: '🥬' },
    { keywords: ['avocado', 'avocados', 'אבוקדו'], emoji: '🥑' },
    { keywords: ['nuts', 'almonds', 'אגוזים', 'שקדים'], emoji: '🥜' },
    { keywords: ['fish', 'salmon', 'דג', 'דגים', 'סלמון'], emoji: '🐟' },
    { keywords: ['chicken', 'poultry', 'עוף', 'פטם', 'עופות'], emoji: '🍗' },
    { keywords: ['eggs', 'egg', 'ביצה', 'ביצים'], emoji: '🥚' },
    { keywords: ['milk', 'dairy', 'חלב', 'מוצרי חלב'], emoji: '🥛' },
    { keywords: ['bread', 'grains', 'לחם', 'דגנים'], emoji: '🍞' },
    { keywords: ['rice', 'אורז'], emoji: '🍚' },
    { keywords: ['salad', 'סלט'], emoji: '🥗' },
    { keywords: ['water', 'hydrate', 'מים', 'שתייה', 'הידרציה'], emoji: '💧' },
    { keywords: ['fruit', 'fruits', 'פרי', 'פירות'], emoji: '🍇' },
    { keywords: ['vegetable', 'vegetables', 'ירק', 'ירקות'], emoji: '🥕' },
    { keywords: ['meat', 'protein', 'בשר', 'חלבון'], emoji: '🥩' },
    { keywords: ['salad', 'סלט'], emoji: '🥗' },
    { keywords: ['dessert', 'sweet', 'קינוח', 'מתוק', 'ממתק'], emoji: '🍰' },
    { keywords: ['breakfast', 'ארוחת בוקר'], emoji: '🌞' },
    { keywords: ['lunch', 'ארוחת צהריים'], emoji: '🍽️' },
    { keywords: ['dinner', 'ארוחת ערב'], emoji: '🌙' },
    { keywords: ['snack', 'חטיף', 'ארוחת ביניים'], emoji: '🥨' },
  ];

  // Add more Hebrew-specific meal types
  const hebrewSpecificKeywords = [
    { keywords: ['חומוס', 'hummus'], emoji: '🥙' },
    { keywords: ['פלאפל', 'falafel'], emoji: '🧆' },
    { keywords: ['פיתה', 'pita'], emoji: '🫓' },
    { keywords: ['שקשוקה', 'shakshuka'], emoji: '🍳' },
    { keywords: ['טחינה', 'tahini'], emoji: '🥣' },
    { keywords: ['סלט ישראלי', 'israeli salad'], emoji: '🥒' },
    { keywords: ['חלה', 'challah'], emoji: '🍞' },
  ];

  // Add contextual emojis
  const allKeywords = [...healthKeywords, ...foodKeywords, ...hebrewSpecificKeywords];
  
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

  // Add greeting emojis in both English and Hebrew
  if (/^(hello|hi|hey|good morning|good afternoon|good evening|שלום|היי|בוקר טוב|צהריים טובים|ערב טוב)/i.test(formattedContent)) {
    formattedContent = `👋 ${formattedContent}`;
  }
  
  // Add encouragement emojis in both English and Hebrew
  if (/(great|excellent|good job|well done|congratulations|מצויין|כל הכבוד|עבודה טובה|מעולה|ברכות)/i.test(formattedContent)) {
    formattedContent = `🎉 ${formattedContent}`;
  }

  return formattedContent;
};

export const isHebrew = (text: string): boolean => {
  // Check if text contains Hebrew characters
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
};
