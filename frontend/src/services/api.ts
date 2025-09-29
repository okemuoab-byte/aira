const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  birthday?: string;
  gender?: string;
  height?: any;
  weight?: any;
  conditions: string[];
  family_history: any[];
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      // Handle 422 validation errors with detailed field-specific messages
      if (response.status === 422 && errorData.detail) {
        const validationError = new Error('Validation failed');
        (validationError as any).validationErrors = errorData.detail;
        (validationError as any).status = 422;
        throw validationError;
      }
      
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    this.setToken(result.access_token);
    return result;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    this.setToken(result.access_token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<User>(response);
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/healthz`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  // Chatbot methods
  async sendChatMessage(message: string, context?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        context
      }),
    });

    return this.handleResponse<any>(response);
  }

  async continueChatConversation(conversationId: string, message: string, context?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat/continue/${conversationId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        context
      }),
    });

    return this.handleResponse<any>(response);
  }

  async getChatHistory(limit: number = 10): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat/history?limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getChatConversation(conversationId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/chatbot/chat/${conversationId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  // Medication AI methods
  async getMedicationSuggestions(query: string, purpose?: string): Promise<any> {
    const url = new URL(`${API_BASE_URL}/medications/suggestions`);
    url.searchParams.append('query', query);
    if (purpose) {
      url.searchParams.append('purpose', purpose);
    }

    // Debug logging
    console.log('🔍 DEBUG: Making medication suggestions request');
    console.log('🔍 Token available:', !!this.token);
    console.log('🔍 Token value:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    console.log('🔍 URL:', url.toString());
    console.log('🔍 Headers:', this.getHeaders());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);

    return this.handleResponse<any>(response);
  }

  async getMedicationSafety(medicationId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/medications/${medicationId}/safety`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  async getMedicationPurpose(medicationName: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/medications/${encodeURIComponent(medicationName)}/purpose`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<any>(response);
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;