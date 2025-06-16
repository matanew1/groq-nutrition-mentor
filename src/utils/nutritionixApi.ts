// Define proper interfaces for Nutritionix API responses
interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  serving_qty: number;
  serving_unit: string;
  nix_item_id?: string;
  serving_weight_grams?: number;
  alt_measures?: Array<{ serving_weight: number, measure: string, seq: number, qty: number }>;
  photo?: { thumb: string, highres: string };
}

interface NutritionixResponse {
  foods: NutritionixFood[];
}

interface NutritionixSearchItem {
  food_name: string;
  brand_name?: string;
  nf_calories?: number;
  nf_protein?: number;
  nf_total_carbohydrate?: number;
  nf_total_fat?: number;
  nf_dietary_fiber?: number;
  nf_sugars?: number;
  serving_qty?: number;
  serving_unit?: string;
  nix_item_id?: string;
  photo?: { thumb: string };
}

interface NutritionixSearchResponse {
  common?: NutritionixSearchItem[];
  branded?: NutritionixSearchItem[];
}

const NUTRITIONIX_APP_ID = 'b09b79de';
const NUTRITIONIX_API_KEY = '26fa217b77c660cf33e43cd3df7dfa83';
const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

// Map of common food-related terms in Hebrew and their English translations
const hebrewToEnglishFoodTerms: Record<string, string> = {
  // Basic nutrition terms
  'קלוריות': 'calories',
  'חלבון': 'protein',
  'פחמימות': 'carbohydrates',
  'שומן': 'fat',
  'סיבים': 'fiber',
  'סיבים תזונתיים': 'dietary fiber',
  'סוכר': 'sugar',
  'ויטמינים': 'vitamins',
  'מינרלים': 'minerals',
  'נתרן': 'sodium',
  'מלח': 'salt',
  'כולסטרול': 'cholesterol',
  'קלוריה': 'calorie',
  'קלוריות ריקות': 'empty calories',
  'ערך תזונתי': 'nutritional value',
  'רכיבים תזונתיים': 'nutritional components',
  'תוספים': 'supplements',
  'אומגה 3': 'omega 3',
  'שומן רווי': 'saturated fat',
  'שומן בלתי רווי': 'unsaturated fat',
  
  // Common food items
  'לחם': 'bread',
  'לחם מלא': 'whole wheat bread',
  'פיתה': 'pita',
  'חלה': 'challah',
  'חלב': 'milk',
  'חלב דל שומן': 'low fat milk',
  'חלב סויה': 'soy milk',
  'חלב שקדים': 'almond milk',
  'ביצה': 'egg',
  'ביצים': 'eggs',
  'חלבון ביצה': 'egg white',
  'חלמון': 'egg yolk',
  'עוף': 'chicken',
  'חזה עוף': 'chicken breast',
  'כרעי עוף': 'chicken legs',
  'כנפיים': 'chicken wings',
  'בשר': 'meat',
  'בשר בקר': 'beef',
  'בשר טחון': 'ground meat',
  'בשר טלה': 'lamb',
  'סטייק': 'steak',
  'המבורגר': 'hamburger',
  'נקניקיות': 'sausages',
  'דג': 'fish',
  'סלמון': 'salmon',
  'טונה': 'tuna',
  'דניס': 'sea bream',
  'בורי': 'mullet',
  'פילה דג': 'fish fillet',
  'אורז': 'rice',
  'אורז מלא': 'brown rice',
  'אורז לבן': 'white rice',
  'תפוח אדמה': 'potato',
  'תפוחי אדמה': 'potatoes',
  'בטטה': 'sweet potato',
  'גבינה': 'cheese',
  'גבינה צהובה': 'yellow cheese',
  'גבינה לבנה': 'white cheese',
  'קוטג': 'cottage cheese',
  'גבינת שמנת': 'cream cheese',
  'יוגורט': 'yogurt',
  'לבן': 'leben',
  'ירקות': 'vegetables',
  'עגבניה': 'tomato',
  'עגבניות': 'tomatoes',
  'מלפפון': 'cucumber',
  'מלפפונים': 'cucumbers',
  'גזר': 'carrot',
  'גזרים': 'carrots',
  'פלפל': 'bell pepper',
  'פלפלים': 'bell peppers',
  'חסה': 'lettuce',
  'בצל': 'onion',
  'בצלים': 'onions',
  'שום': 'garlic',
  'פטריות': 'mushrooms',
  'ברוקולי': 'broccoli',
  'כרוב': 'cabbage',
  'כרובית': 'cauliflower',
  'חציל': 'eggplant',
  'אבוקדו': 'avocado',
  'תירס': 'corn',
  'פירות': 'fruits',
  'תפוח': 'apple',
  'תפוחים': 'apples',
  'בננה': 'banana',
  'בננות': 'bananas',
  'תפוז': 'orange',
  'תפוזים': 'oranges',
  'לימון': 'lemon',
  'אשכולית': 'grapefruit',
  'ענבים': 'grapes',
  'תות': 'strawberry',
  'תותים': 'strawberries',
  'אבטיח': 'watermelon',
  'מלון': 'melon',
  'אננס': 'pineapple',
  'מנגו': 'mango',
  'קפה': 'coffee',
  'תה': 'tea',
  'מים': 'water',
  'משקה': 'drink',
  'משקאות': 'drinks',
  'יין': 'wine',
  'בירה': 'beer',
  'שוקולד': 'chocolate',
  'עוגה': 'cake',
  'עוגיות': 'cookies',
  'ממתקים': 'sweets',
  'גלידה': 'ice cream',
  
  // Food categories & preparations
  'לאפות': 'baking',
  'לטגן': 'frying',
  'לבשל': 'cooking',
  'להרתיח': 'boiling',
  'לאדות': 'steaming',
  'צלוי': 'roasted',
  'מטוגן': 'fried',
  'מבושל': 'cooked',
  'אפוי': 'baked',
  'חי': 'raw',
  'קציצות': 'meatballs',
  'תבשיל': 'stew',
  'מרק': 'soup',
  'סלט': 'salad',
  'חומוס': 'hummus',
  'טחינה': 'tahini',
  'פלאפל': 'falafel',
  'שקשוקה': 'shakshuka',
  'מוזלי': 'muesli',
  'גרנולה': 'granola',
  'פסטה': 'pasta',
  'ספגטי': 'spaghetti',
  'פיצה': 'pizza',
  'סנדוויץ': 'sandwich',
  'כריך': 'sandwich',
  
  // Meal types
  'ארוחת בוקר': 'breakfast',
  'ארוחת צהריים': 'lunch',
  'ארוחת ערב': 'dinner',
  'ארוחת ביניים': 'snack',
  'מנה ראשונה': 'appetizer',
  'מנה עיקרית': 'main course',
  'קינוח': 'dessert',
  
  // Measurements
  'כוס': 'cup',
  'כוסות': 'cups',
  'כפית': 'teaspoon',
  'כפיות': 'teaspoons',
  'כף': 'tablespoon',
  'כפות': 'tablespoons',
  'גרם': 'gram',
  'גרמים': 'grams',
  'ק"ג': 'kilogram',
  'קילו': 'kilogram',
  'קילוגרם': 'kilogram',
  'מנה': 'serving',
  'מנות': 'servings',
  'חתיכה': 'piece',
  'חתיכות': 'pieces',
  'פרוסה': 'slice',
  'פרוסות': 'slices',
  'מ"ל': 'ml',
  'מיליליטר': 'milliliter',
  'ליטר': 'liter',
  
  // Diet types
  'טבעוני': 'vegan',
  'צמחוני': 'vegetarian',
  'טבעונות': 'veganism',
  'צמחונות': 'vegetarianism',
  'דיאטה': 'diet',
  'דיאטה דלת פחמימות': 'low carb diet',
  'דיאטה דלת שומן': 'low fat diet',
  'כשר': 'kosher',
  'גלוטן': 'gluten',
  'נטול גלוטן': 'gluten free',
  'דל נתרן': 'low sodium',
  'דל שומן': 'low fat',
  'דל סוכר': 'low sugar'
};

// Hebrew food modifier words to consider in pattern matching
const hebrewFoodModifiers: string[] = [
  'של', 'עם', 'בלי', 'ללא', 'מלא', 'קצת', 'הרבה', 'טרי', 'קפוא', 
  'אורגני', 'טבעי', 'ביתי', 'מבושל', 'חתוך', 'פרוס', 'קצוץ', 'מגורד'
];

/**
 * Translates Hebrew food terms to English to improve API results
 * @param query The Hebrew food query
 * @returns A query with Hebrew food terms translated to English
 */
function translateHebrewFoodTerms(query: string): string {
  let translatedQuery = query;
  
  // Check if query contains Hebrew characters
  if (!/[\u0590-\u05FF]/.test(query)) {
    return query;
  }
  
  // Replace Hebrew food terms with English equivalents
  Object.entries(hebrewToEnglishFoodTerms).forEach(([hebrew, english]) => {
    // Case insensitive replacement with word boundaries
    const regex = new RegExp(`\\b${hebrew}\\b`, 'gi');
    translatedQuery = translatedQuery.replace(regex, english);
  });
  
  return translatedQuery;
}

/**
 * Performs more sophisticated translation for complex Hebrew food queries
 * @param query The Hebrew food query
 * @returns A better translated version for the Nutritionix API
 */
function advancedHebrewTranslation(query: string): string {
  // First apply direct term-by-term translation
  let translatedQuery = translateHebrewFoodTerms(query);
  
  // If nothing changed, return the original query
  if (translatedQuery === query) {
    return query;
  }
  
  // Handle common Hebrew food combinations and phrases that need special handling
  const specialCases: Record<string, string> = {
    // Common Israeli dishes
    'סלט ירקות ישראלי': 'Israeli vegetable salad',
    'חביתת ירק': 'vegetable omelette',
    'לחם עם חומוס': 'bread with hummus',
    'סלט עוף': 'chicken salad',
    'שקשוקה עם ביצים': 'shakshuka with eggs',
    'פיתה עם חומוס': 'pita with hummus',
    'עוף בגריל': 'grilled chicken',
    'אורז עם עוף': 'rice with chicken',
    'דג בתנור': 'baked fish',
    'בשר טחון עם אורז': 'ground meat with rice',
    'קציצות בשר': 'meat balls',
    'עוף עם תפוחי אדמה': 'chicken with potatoes',
    'סלט טונה': 'tuna salad',
    'ביצה קשה': 'hard boiled egg',
    'חביתה': 'omelette',
    'גבינה צהובה עם לחם': 'yellow cheese with bread',
    'טוסט גבינה': 'cheese toast',
    'חזה עוף מבושל': 'boiled chicken breast',
    'בשר בקר צלוי': 'roast beef',
    
    // Common food combinations
    'תפוח אדמה אפוי': 'baked potato',
    'אורז מלא מבושל': 'cooked brown rice',
    'סלט ירקות קצוץ': 'chopped vegetable salad',
    'עוף בתנור': 'baked chicken',
    
    // Common food quantities
    'כוס חלב': 'cup of milk',
    'כף טחינה': 'tablespoon of tahini',
    'כפית סוכר': 'teaspoon of sugar',
    'פרוסת לחם': 'slice of bread',
    'פרוסת גבינה': 'slice of cheese',
    'חתיכת עוף': 'piece of chicken',
    'כוס יוגורט': 'cup of yogurt',
    'פרי אחד': 'one fruit',
    'פרוסות לחם': 'slices of bread',
    'גרם בשר': 'grams of meat'
  };
  
  // Try to match special cases
  for (const [hebrewPhrase, englishPhrase] of Object.entries(specialCases)) {
    if (query.includes(hebrewPhrase)) {
      translatedQuery = translatedQuery.replace(hebrewPhrase, englishPhrase);
    }
  }
  
  // Handle quantity patterns - Hebrew number + food item
  // For example: "2 ביצים" (2 eggs), "3 תפוחים" (3 apples)
  const hebrewNumbersRegex = /(\d+)\s+([\u0590-\u05FF]+)/g;
  translatedQuery = translatedQuery.replace(hebrewNumbersRegex, (match, number, hebrewWord) => {
    const translated = translateHebrewFoodTerms(hebrewWord);
    // If the word was translated, use the number with it
    if (translated !== hebrewWord) {
      return `${number} ${translated}`;
    }
    return match;
  });
  
  return translatedQuery;
}

function extractFoodQuery(query: string): string {
  // Check if query contains Hebrew characters
  const isHebrew = /[\u0590-\u05FF]/.test(query);
  
  // English patterns for food queries
  const englishFoodPhrasePatterns = [
    /(?:calories|nutrition|nutrients|macros|protein|carbs|fat)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
    /(?:how many calories|how much protein|how many carbs|nutritional value)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
    /(?:what is|tell me about)\s+(?:the nutrition|the calories|the protein|the carbs)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
    /(?:serving of|portion of|amount of)\s+(.+?)(?:$|\?|\.)/i,
    /(?:what are|how many)\s+(?:the nutrition facts|calories)\s+(?:in|of)\s+(.+?)(?:$|\?|\.)/i,
    /(?:i ate|i had|i consumed)\s+(.+?)(?:$|\?|\.|,)/i,
    /(?:analyze|check|evaluate)\s+(?:the nutrition|nutritional content|food)\s+(?:of|in)\s+(.+?)(?:$|\?|\.)/i,
  ];
  
  // Hebrew patterns for food queries - covering various Hebrew phrasings
  const hebrewFoodPhrasePatterns = [
    // Nutrition information patterns
    /(?:קלוריות|תזונה|ערך תזונתי|חלבון|פחמימות|שומן)\s+(?:ב|של|עבור)\s+(.+?)(?:$|\?|\.)/i,
    /(?:כמה קלוריות|כמה חלבון|כמה פחמימות|ערך תזונתי)\s+(?:יש ב|יש ל|ב|של|עבור)\s+(.+?)(?:$|\?|\.)/i,
    /(?:מה|ספר לי על)\s+(?:הקלוריות|הערך התזונתי|החלבון|הפחמימות|התזונה)\s+(?:של|ב|עבור)\s+(.+?)(?:$|\?|\.)/i,
    
    // Serving patterns
    /(?:מנה של|כמות של|חתיכת|פרוסת)\s+(.+?)(?:$|\?|\.)/i,
    
    // What is X patterns (simple food identification)
    /(?:מהו|מה זה|מה ההרכב של)\s+(.+?)(?:$|\?|\.)/i,
    
    // Food consumption patterns
    /(?:אכלתי|אכלנו|אכל|אוכל|אוכלת)\s+(.+?)(?:$|\?|\.|,)/i,
    
    // Direct questions about food
    /(?:תנתח|בדוק|מה יש ב|מה מכיל)\s+(.+?)(?:$|\?|\.)/i,
    
    // "Tell me about" patterns
    /(?:ספר לי על|מידע על|פרטים על)\s+(.+?)(?:$|\?|\.)/i,
    
    // Catch-all for simpler food queries in Hebrew
    /(?:מזון|אוכל|מאכל|מנה)\s+(?:של|כמו|זה)\s+(.+?)(?:$|\?|\.)/i,
  ];
  
  // Choose which patterns to use based on language
  const foodPhrasePatterns = isHebrew ? hebrewFoodPhrasePatterns : englishFoodPhrasePatterns;
  
  // Try to match with language-appropriate patterns
  for (const pattern of foodPhrasePatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Try the other language's patterns if first set didn't match
  const secondaryPatterns = isHebrew ? englishFoodPhrasePatterns : hebrewFoodPhrasePatterns;
  for (const pattern of secondaryPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Direct food identification in Hebrew (for queries that are just food names)
  if (isHebrew) {
    // Check if the query contains only a food item and possibly modifiers
    for (const [foodHebrew, _] of Object.entries(hebrewToEnglishFoodTerms)) {
      const foodRegex = new RegExp(`^(?:${hebrewFoodModifiers.join('|')}\\s+)?${foodHebrew}(?:\\s+(?:${hebrewFoodModifiers.join('|')}))?$`, 'i');
      if (foodRegex.test(query)) {
        return query.trim();
      }
    }
  }

  return query;
}

function detectLanguage(query: string): string {
  const hebrewPattern = /[\u0590-\u05FF]/;
  if (hebrewPattern.test(query)) {
    return 'he-IL';
  }
  
  return 'en-US';
}

export async function searchNutrition(query: string): Promise<NutritionixResponse> {
  try {
    console.log('Calling Nutritionix API with query:', query);
    
    // Extract the food query from the full question
    const foodQuery = extractFoodQuery(query);
    console.log('Extracted food query:', foodQuery);
    
    // Detect language and translate Hebrew to English if needed
    const detectedLanguage = detectLanguage(query);
    const isHebrew = detectedLanguage.startsWith('he');
    const timezone = isHebrew ? 'Asia/Jerusalem' : 'US/Eastern';
    
    // Translate Hebrew food terms to English for better API results
    let processedQuery = foodQuery;
    if (isHebrew) {
      // Use advanced translation for better handling of complex Hebrew phrases
      processedQuery = advancedHebrewTranslation(foodQuery);
      console.log('Translated query from Hebrew:', processedQuery);
    }
    
    // Call the Nutritionix API with processed query
    const response = await fetch(NUTRITIONIX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'x-remote-user-id': '0',
        'x-app-usage-tier': 'dev',
        'x-app-version': '1.0',
      },
      body: JSON.stringify({
        query: processedQuery,
        timezone: timezone,
        locale: detectedLanguage,
        use_branded_foods: true,
        detailed: true,
        use_raw_foods: false
      }),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        console.log('Natural language API failed, trying search fallback');
        
        // Try search API as fallback with translated query if in Hebrew
        const searchResults = await searchFood(processedQuery);
        
        if (searchResults && 
            (searchResults.common?.length > 0 || searchResults.branded?.length > 0)) {
          const formattedResults = {
            foods: []
          };
          
          if (searchResults.common?.length > 0) {
            const commonFood = searchResults.common[0];
            const detailedFood = await fetchSingleFoodDetails(commonFood.food_name);
            if (detailedFood && detailedFood.foods?.length > 0) {
              formattedResults.foods.push(detailedFood.foods[0]);
            }
          } 
          else if (searchResults.branded?.length > 0) {
            const brandedFood = searchResults.branded[0];
            formattedResults.foods.push({
              food_name: brandedFood.food_name,
              brand_name: brandedFood.brand_name,
              nf_calories: brandedFood.nf_calories,
              nf_protein: brandedFood.nf_protein,
              nf_total_carbohydrate: brandedFood.nf_total_carbohydrate,
              nf_total_fat: brandedFood.nf_total_fat,
              nf_dietary_fiber: brandedFood.nf_dietary_fiber || 0,
              nf_sugars: brandedFood.nf_sugars || 0,
              serving_qty: brandedFood.serving_qty || 1,
              serving_unit: brandedFood.serving_unit || 'serving',
              nix_item_id: brandedFood.nix_item_id
            });
          }
          
          return formattedResults;
        }
        
        // Try one more fallback with just food name if in Hebrew
        if (isHebrew && processedQuery !== foodQuery) {
          // Check if we can directly match any specific food item in our Hebrew dictionary
          for (const [hebrew, english] of Object.entries(hebrewToEnglishFoodTerms)) {
            if (foodQuery.trim().toLowerCase() === hebrew.toLowerCase()) {
              console.log('Direct Hebrew food match found, trying with:', english);
              const directResults = await searchFood(english);
              
              if (directResults && 
                  (directResults.common?.length > 0 || directResults.branded?.length > 0)) {
                const formattedResults = {
                  foods: []
                };
                
                if (directResults.common?.length > 0) {
                  const commonFood = directResults.common[0];
                  const detailedFood = await fetchSingleFoodDetails(commonFood.food_name);
                  if (detailedFood && detailedFood.foods?.length > 0) {
                    formattedResults.foods.push(detailedFood.foods[0]);
                  }
                } else if (directResults.branded?.length > 0) {
                  const brandedFood = directResults.branded[0];
                  formattedResults.foods.push({
                    food_name: brandedFood.food_name,
                    brand_name: brandedFood.brand_name,
                    nf_calories: brandedFood.nf_calories,
                    nf_protein: brandedFood.nf_protein,
                    nf_total_carbohydrate: brandedFood.nf_total_carbohydrate,
                    nf_total_fat: brandedFood.nf_total_fat,
                    nf_dietary_fiber: brandedFood.nf_dietary_fiber || 0,
                    nf_sugars: brandedFood.nf_sugars || 0,
                    serving_qty: brandedFood.serving_qty || 1,
                    serving_unit: brandedFood.serving_unit || 'serving',
                    nix_item_id: brandedFood.nix_item_id
                  });
                }
                
                return formattedResults;
              }
              break;
            }
          }
        }
      }
      
      throw new Error(`Nutritionix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Nutritionix API response:', data);
    
    if (data && data.foods && data.foods.length > 0) {
      data.foods = data.foods.map((food: NutritionixFood) => {
        return {
          ...food,
          nf_calories: food.nf_calories || 0,
          nf_protein: food.nf_protein || 0,
          nf_total_carbohydrate: food.nf_total_carbohydrate || 0,
          nf_total_fat: food.nf_total_fat || 0,
          nf_dietary_fiber: food.nf_dietary_fiber || 0,
          nf_sugars: food.nf_sugars || 0,
          serving_qty: food.serving_qty || 1,
          serving_unit: food.serving_unit || 'serving'
        };
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error calling Nutritionix API:', error);
    throw error;
  }
}

async function fetchSingleFoodDetails(query: string): Promise<NutritionixResponse | null> {
  try {
    console.log('Fetching details for food:', query);
    
    // Check if query is in Hebrew
    const isHebrew = /[\u0590-\u05FF]/.test(query);
    let processedQuery = query;
    
    if (isHebrew) {
      processedQuery = advancedHebrewTranslation(query);
      console.log('Translated query for fetching details:', processedQuery);
    }
    
    const response = await fetch(NUTRITIONIX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'x-remote-user-id': '0',
      },
      body: JSON.stringify({
        query: processedQuery,
        timezone: isHebrew ? 'Asia/Jerusalem' : 'US/Eastern',
        detailed: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix details API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching food details:', error);
    return null;
  }
}

// Enhanced search function with better error handling and typing
export async function searchFood(query: string): Promise<NutritionixSearchResponse> {
  try {
    console.log('Searching for food:', query);
    
    // Check if query is in Hebrew
    const isHebrew = /[\u0590-\u05FF]/.test(query);
    let processedQuery = query;
    
    if (isHebrew) {
      processedQuery = advancedHebrewTranslation(query);
      console.log('Translated query for search:', processedQuery);
    }
    
    const searchUrl = 'https://trackapi.nutritionix.com/v2/search/instant';
    
    const response = await fetch(`${searchUrl}?query=${encodeURIComponent(processedQuery)}`, {
      method: 'GET',
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
        'x-remote-user-id': '0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nutritionix search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as NutritionixSearchResponse;
    console.log('Nutritionix search response:', data);
    
    return data;
  } catch (error) {
    console.error('Error searching Nutritionix API:', error);
    // Return empty result structure instead of throwing
    return { common: [], branded: [] };
  }
}
