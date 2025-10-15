// Minimal client for MindCare chatbot backend
export interface MindCareResponse {
  response: string;
  mood: string;
  emergency: boolean;
  language: string;
}

export async function sendToMindCare(message: string, conversationHistory?: Array<{ user: string; assistant?: string; mood?: string; language?: string }>): Promise<MindCareResponse> {
  const baseUrl = (import.meta as any).env?.VITE_MINDCARE_BASE_URL || process.env.VITE_MINDCARE_BASE_URL || '';
  const endpoint = `${baseUrl}/api/chat`.replace(/\/$/, '/api/chat');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`MindCare error ${res.status}`);
    }
    const data = await res.json();
    // Basic shape validation
    if (typeof data?.response !== 'string') {
      throw new Error('Invalid MindCare response');
    }
    return {
      response: data.response,
      mood: data.mood ?? 'normal',
      emergency: !!data.emergency,
      language: data.language ?? 'en'
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}


