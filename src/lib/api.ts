const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

import { Transaction } from '@/types'

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        body: options.body,
        baseUrl: this.baseUrl,
        endpoint
      });
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      // If the response already has a success field, return it as is
      // Otherwise, wrap it in our standard format
      if (data && typeof data === 'object' && 'success' in data) {
        return data;
      }
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    console.log('🔐 LOGIN ATTEMPT:', { username, password })
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    console.log('🔐 LOGIN RESPONSE:', response)
    return response;
  }

  async register(userData: {
    username: string;
    name: string;
    age: string;
    theme: string;
    spendingPersonality: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(username: string) {
    return this.request(`/auth/profile/${username}`);
  }



  // Transaction endpoints
  async getTransactions(userId: string, limit = 20, offset = 0) {
    return this.request(`/transactions/${userId}?limit=${limit}&offset=${offset}`);
  }

  async getRecentTransactions(userId: string) {
    return this.request(`/transactions/${userId}/recent`);
  }

  async addTransaction(userId: string, transactionData: {
    date: string;
    merchant: string;
    amount: number;
    category: string;
    paymentMode: string;
  }) {
    return this.request(`/transactions/${userId}`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Get all transactions for budget calculation (persona + manual)
  async getBudgetTransactions(userId: string) {
    return this.request(`/transactions/${userId}/budget`);
  }

  // Clear all manual transactions (monthly reset)
  async clearManualTransactions(userId: string) {
    return this.request(`/transactions/${userId}/manual`, {
      method: 'DELETE',
    });
  }

  // Salary management
  async getSalary(userId: string) {
    return this.request(`/salary/${userId}`);
  }

  async updateSalary(userId: string, salary: number) {
    return this.request(`/salary/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ salary }),
    });
  }

  async clearSalary(userId: string) {
    return this.request(`/salary/${userId}`, {
      method: 'DELETE',
    });
  }

  async simulateTransactions(userId: string, spendingPersonality: string) {
    return this.request(`/transactions/${userId}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ spendingPersonality }),
    });
  }

  async deleteTransaction(transactionId: string) {
    return this.request(`/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }



  // Chat endpoints
  async getChatHistory(userId: string, limit = 50) {
    return this.request(`/chat/${userId}?limit=${limit}`);
  }

  async sendMessage(userId: string, message: string) {
    return this.request(`/chat/${userId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async clearChatHistory(userId: string) {
    return this.request(`/chat/${userId}`, {
      method: 'DELETE',
    });
  }

  // Nudge endpoints
  async getNudges(userId: string, unreadOnly = false) {
    return this.request(`/nudges/${userId}?unreadOnly=${unreadOnly}`);
  }

  async markNudgeAsRead(nudgeId: string) {
    return this.request(`/nudges/${nudgeId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNudgesAsRead(userId: string) {
    return this.request(`/nudges/${userId}/read-all`, {
      method: 'PATCH',
    });
  }

  async respondToNudge(nudgeId: string, response: 'accepted' | 'ignored' | 'snoozed') {
    return this.request(`/nudges/${nudgeId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response }),
    });
  }

  async generateNudges(userId: string) {
    return this.request(`/nudges/${userId}/generate`, {
      method: 'POST',
    });
  }

  async deleteNudge(nudgeId: string) {
    return this.request(`/nudges/${nudgeId}`, {
      method: 'DELETE',
    });
  }

  // Get current system date
  async getCurrentDate(): Promise<ApiResponse<{ currentDate: string; serverTime: string; timezone: string }>> {
    return this.request('/system/date');
  }

  // Get persona-based transactions up to current date
  async getPersonaTransactions(userType: string, currentDate: string): Promise<ApiResponse<{ transactions: Transaction[]; userType: string; currentDate: string; totalTransactions: number; totalAmount: number }>> {
    return this.request(`/personas/${userType}/transactions/${currentDate}`);
  }

  async getLatestTransactions(personaType: string, limit: number = 10): Promise<ApiResponse<{ transactions: Transaction[]; personaType: string; totalTransactions: number; totalAmount: number }>> {
    return this.request(`/transactions/latest/${personaType}?limit=${limit}`);
  }

  async getWeeklyTransactions(personaType: string): Promise<ApiResponse<Array<{ day: string; amount: number; date: string; percentage: number }>>> {
    return this.request(`/transactions/weekly/${personaType}`);
  }

  async getUserWeeklyTransactions(userId: string): Promise<ApiResponse<Array<{ day: string; amount: number; date: string; percentage: number }>>> {
    return this.request(`/transactions/${userId}/weekly`);
  }

  async getTransactionStats(personaType: string, days: number = 30): Promise<ApiResponse<{ totalAmount: number; transactionCount: number; averageAmount: number; topCategories: Array<{ category: string; amount: number; count: number }> }>> {
    return this.request(`/transactions/stats/${personaType}?days=${days}`);
  }

  // Get available persona types
  async getPersonaTypes(): Promise<ApiResponse<{ personaTypes: string[] }>> {
    return this.request('/personas/types');
  }

  // Get system health
  async getSystemHealth(): Promise<ApiResponse<{ status: string; uptime: string; memory: { used: number; total: number; percentage: number }; timestamp: string }>> {
    return this.request('/system/health');
  }

  // Financial endpoints
  async getFinancialMetrics(userId: string) {
    return this.request(`/financial/metrics/${userId}`);
  }

  async getBudgetOverview(userId: string) {
    return this.request(`/financial/budget/${userId}`);
  }

  async getSpendingPatterns(userId: string, days = 30) {
    return this.request(`/financial/patterns/${userId}?days=${days}`);
  }

  async getWeeklySpending(userId: string) {
    return this.request(`/financial/weekly/${userId}`);
  }



  // Budget cap management
  async getBudgetCaps(userId: string): Promise<ApiResponse<{ budgetCaps: { [category: string]: number }, spendingPersonality: string }>> {
    return this.request(`/budget/${userId}`);
  }

  async updateBudgetCap(userId: string, category: string, budgetCap: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request(`/budget/${userId}/${category}`, {
      method: 'PUT',
      body: JSON.stringify({ budgetCap }),
    });
  }

  async resetBudgetCaps(userId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request(`/budget/${userId}`, {
      method: 'DELETE',
    });
  }

  async getFinancialInsights(userId: string) {
    return this.request(`/financial/insights/${userId}`);
  }

  // Agentic AI Insights endpoints
  async getAgenticInsights(userId: string, limit = 3) {
    console.log('🔍 API DEBUG: Calling getAgenticInsights for user:', userId, 'limit:', limit)
    try {
      const response = await this.request(`/agentic/insights/${userId}/insights?limit=${limit}`);
      console.log('🔍 API DEBUG: getAgenticInsights response:', response)
      return response;
    } catch (error) {
      console.error('🔍 API DEBUG: getAgenticInsights error:', error)
      throw error;
    }
  }

  // Advanced Analytics endpoints
  async getSpendingTrends(userId: string, months = 3) {
    try {
      const response = await this.request(`/analytics/${userId}/trends?months=${months}`);
      return response;
    } catch (error) {
      console.error('Error fetching spending trends:', error);
      throw error;
    }
  }

  async getFinancialHealthScore(userId: string) {
    try {
      const response = await this.request(`/analytics/${userId}/health-score`);
      return response;
    } catch (error) {
      console.error('Error fetching financial health score:', error);
      throw error;
    }
  }

  async getMoodSpendCorrelation(userId: string) {
    try {
      const response = await this.request(`/analytics/${userId}/mood-correlation`);
      return response;
    } catch (error) {
      console.error('Error fetching mood-spend correlation:', error);
      throw error;
    }
  }

  async getPredictivePatterns(userId: string) {
    try {
      const response = await this.request(`/analytics/${userId}/predictions`);
      return response;
    } catch (error) {
      console.error('Error fetching predictive patterns:', error);
      throw error;
    }
  }

  async getAnalyticsReport(userId: string) {
    try {
      const response = await this.request(`/analytics/${userId}/report`);
      return response;
    } catch (error) {
      console.error('Error fetching analytics report:', error);
      throw error;
    }
  }

  async getCategoryInsights(userId: string) {
    try {
      const response = await this.request(`/analytics/${userId}/category-insights`);
      return response;
    } catch (error) {
      console.error('Error fetching category insights:', error);
      throw error;
    }
  }

  async generateAgenticInsights(userId: string, transactionData?: Transaction[]) {
    return this.request(`/agentic/insights/${userId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ transactionData }),
    });
  }

  async updateInsightResponse(userId: string, insightId: string, response: string) {
    return this.request(`/agentic/insights/${userId}/insights/${insightId}/response`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    });
  }

  async deactivateInsight(userId: string, insightId: string) {
    return this.request(`/agentic/insights/${userId}/insights/${insightId}`, {
      method: 'DELETE',
    });
  }

  // Agentic Chatbot endpoints
  async createChatbotContextFromInsight(userId: string, insightId: string) {
    return this.request(`/agentic/chatbot/${userId}/context/insight`, {
      method: 'POST',
      body: JSON.stringify({ insightId }),
    });
  }

  async createChatbotContextFromNotification(userId: string, notificationId: string) {
    return this.request(`/agentic/chatbot/${userId}/context/notification`, {
      method: 'POST',
      body: JSON.stringify({ notificationId }),
    });
  }

  async createChatbotContextForTransaction(userId: string, transactionData: Transaction) {
    return this.request(`/agentic/chatbot/${userId}/context/transaction`, {
      method: 'POST',
      body: JSON.stringify({ transactionData }),
    });
  }

  async sendChatbotMessage(userId: string, message: string, sessionId: string) {
    return this.request(`/agentic/chatbot/${userId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async getChatbotHistory(userId: string, sessionId: string) {
    return this.request(`/agentic/chatbot/${userId}/chat/${sessionId}/history`);
  }

  async getActiveChatbotContext(userId: string, sessionId?: string) {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    return this.request(`/agentic/chatbot/${userId}/context/active${params}`);
  }

  async deactivateChatbotContext(userId: string, sessionId: string) {
    return this.request(`/agentic/chatbot/${userId}/context/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Behavioral tracking methods
  async recordInsightResponse(
    userId: string, 
    insightId: string, 
    response: 'accepted' | 'ignored' | 'snoozed' | 'dismissed'
  ) {
    console.log('🧠 RECORDING USER RESPONSE:', { userId, insightId, response });
    try {
      const apiResponse = await this.request(`/agentic/insights/${userId}/insights/${insightId}/response`, {
        method: 'PUT',
        body: JSON.stringify({ response })
      });
      console.log('🧠 RESPONSE RECORDED:', apiResponse);
      return apiResponse;
    } catch (error) {
      console.error('Error recording insight response:', error);
      throw error;
    }
  }

  async getUserBehavior(userId: string) {
    console.log('🧠 FETCHING USER BEHAVIOR:', { userId });
    try {
      const response = await this.request(`/agentic/insights/${userId}/behavior`);
      console.log('🧠 USER BEHAVIOR RESPONSE:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      throw error;
    }
  }

  // Phase 4 Advanced AI Features
  async getBudgetOptimization(userId: string) {
    try {
      const response = await this.request(`/phase4/${userId}/budget-optimization`);
      return response;
    } catch (error) {
      console.error('Error fetching budget optimization:', error);
      throw error;
    }
  }

  async getFinancialGoals(userId: string) {
    try {
      const response = await this.request(`/phase4/${userId}/financial-goals`);
      return response;
    } catch (error) {
      console.error('Error fetching financial goals:', error);
      throw error;
    }
  }

  async getPersonalizedInsights(userId: string) {
    try {
      const response = await this.request(`/phase4/${userId}/personalized-insights`);
      return response;
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      throw error;
    }
  }

  async getFinancialEducation(userId: string) {
    try {
      const response = await this.request(`/phase4/${userId}/financial-education`);
      return response;
    } catch (error) {
      console.error('Error fetching financial education:', error);
      throw error;
    }
  }

  async getPhase4ComprehensiveReport(userId: string) {
    try {
      const response = await this.request(`/phase4/${userId}/comprehensive-report`);
      return response;
    } catch (error) {
      console.error('Error fetching Phase 4 comprehensive report:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 