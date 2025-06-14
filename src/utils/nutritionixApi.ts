
const NUTRITIONIX_APP_ID = 'b09b79de';
const NUTRITIONIX_API_KEY = '26fa217b77c660cf33e43cd3df7dfa83';
const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

export async function searchNutrition(query: string): Promise<any> {
  try {
    console.log('Calling Nutritionix API with query:', query);
    
    const response = await fetch(NUTRITIONIX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
      },
      body: JSON.stringify({
        query: query,
        timezone: 'US/Eastern'
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Nutritionix API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error calling Nutritionix API:', error);
    throw error;
  }
}

export async function searchFood(query: string): Promise<any> {
  try {
    const searchUrl = 'https://trackapi.nutritionix.com/v2/search/instant';
    
    const response = await fetch(`${searchUrl}?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Nutritionix search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Nutritionix search response:', data);
    
    return data;
  } catch (error) {
    console.error('Error searching Nutritionix API:', error);
    throw error;
  }
}
