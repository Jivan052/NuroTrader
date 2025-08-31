// src/proxy/api-controller.ts
import { getGeminiService } from './gemini-api';

interface ChatRequest {
  message: string;
  sessionId?: string;
}

export class ProxyController {
  private geminiApiKey: string;

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey;
  }

  async handleChatRequest(request: ChatRequest) {
    try {
      const geminiService = getGeminiService(this.geminiApiKey);
      const response = await geminiService.sendMessage(request.message, request.sessionId);
      return response;
    } catch (error) {
      console.error('Error in chat request:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string) {
    try {
      const geminiService = getGeminiService(this.geminiApiKey);
      const history = geminiService.getSessionHistory(sessionId);
      return { sessionId, history };
    } catch (error) {
      console.error('Error getting session history:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string) {
    try {
      const geminiService = getGeminiService(this.geminiApiKey);
      const success = geminiService.clearSession(sessionId);
      return { success, sessionId };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}

let controllerInstance: ProxyController | null = null;

export const getProxyController = (apiKey?: string): ProxyController => {
  if (!controllerInstance && apiKey) {
    controllerInstance = new ProxyController(apiKey);
  } else if (!controllerInstance && !apiKey) {
    throw new Error('API key is required to initialize ProxyController');
  }
  
  return controllerInstance!;
};
