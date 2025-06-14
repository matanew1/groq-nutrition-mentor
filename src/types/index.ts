
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  nutritionData?: {
    foods: any[];
  } | null;
}
