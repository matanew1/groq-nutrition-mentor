
export interface MealPlan {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name: string;
  calories?: number;
  time?: string;
  nutrition_data?: any;
}

export type MealTypeKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealTypeDetails {
    key: MealTypeKey;
    icon: string;
    style: string;
    label: string;
}
