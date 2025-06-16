
export interface TranslationKey {
  nutrimentor: string;
  subtitle: string;
  chat: string;
  meals: string;
  water: string;
  typeMessage: string;
  loading: string;
  error: string;
  success: string;
  signIn: string;
  signOut: string;
  welcome: string;
  clearChat: string;
  nutritionFacts: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  signInRequired: string;
  signInToSaveMeals: string;
  selectDate: string;
  addNewMeal: string;
  enterMealName: string;
  addMeal: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  noMealsPlanned: string;
  addingMealWithNutrition: string;
}

export const translations = {
  en: {
    nutrimentor: "NutriMentor AI",
    subtitle: "Your AI-powered nutrition companion",
    chat: "Chat",
    meals: "Meals",
    water: "Water",
    typeMessage: "Type your nutrition question...",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    signIn: "Sign In",
    signOut: "Sign Out",
    welcome: "Welcome",
    clearChat: "Clear Chat",
    nutritionFacts: "Nutrition Facts",
    calories: "calories",
    protein: "protein",
    carbs: "carbs",
    fat: "fat",
    signInRequired: "Sign In Required",
    signInToSaveMeals: "Please sign in to save and track your meals",
    selectDate: "Select Date",
    addNewMeal: "Add New Meal",
    enterMealName: "Enter meal name...",
    addMeal: "Add Meal",
    breakfast: "Breakfast",
    lunch: "Lunch", 
    dinner: "Dinner",
    snack: "Snack",
    noMealsPlanned: "No meals planned for",
    addingMealWithNutrition: "Adding meal with nutrition data..."
  } as TranslationKey,
  he: {
    nutrimentor: "נוטרי מנטור AI",
    subtitle: "המלווה התזונתי החכם שלך",
    chat: "צ'אט",
    meals: "ארוחות",
    water: "מים",
    typeMessage: "כתוב את השאלה התזונתית שלך...",
    loading: "טוען...",
    error: "שגיאה",
    success: "הצלחה",
    signIn: "התחבר",
    signOut: "התנתק",
    welcome: "ברוך הבא",
    clearChat: "נקה צ'אט",
    nutritionFacts: "נתונים תזונתיים",
    calories: "קלוריות",
    protein: "חלבון",
    carbs: "פחמימות",
    fat: "שומן",
    signInRequired: "נדרשת התחברות",
    signInToSaveMeals: "אנא התחבר כדי לשמור ולעקוב אחר הארוחות שלך",
    selectDate: "בחר תאריך",
    addNewMeal: "הוסף ארוחה חדשה",
    enterMealName: "הכנס שם ארוחה...",
    addMeal: "הוסף ארוחה",
    breakfast: "ארוחת בוקר",
    lunch: "ארוחת צהריים",
    dinner: "ארוחת ערב", 
    snack: "חטיף",
    noMealsPlanned: "לא נתוכננו ארוחות עבור",
    addingMealWithNutrition: "מוסיף ארוחה עם נתונים תזונתיים..."
  } as TranslationKey
};
