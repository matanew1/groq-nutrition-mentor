
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroqAPI(message: string): Promise<string> {
  try {
    console.log('Calling Groq API with message:', message);
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'compound-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutrition mentor and health coach. Provide helpful, accurate, and encouraging nutrition advice. Keep responses informative but conversational. Focus on practical tips, healthy eating habits, and evidence-based nutrition information.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Groq API response:', data);

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from Groq API');
    }
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}
