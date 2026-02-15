// Central API configuration for QuantumPay
// Use Vite env variable `VITE_API_BASE_URL` (e.g. http://localhost:5000/api)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/profile`,
  },
  wallet: {
    addMoney: `${API_BASE_URL}/wallet/add`,
    sendMoney: `${API_BASE_URL}/wallet/send`,
    history: `${API_BASE_URL}/wallet/history`,
  },
  user: {
    profile: `${API_BASE_URL}/auth/profile`,
    update: `${API_BASE_URL}/auth/profile`,
  },
};

// Token management
const TOKEN_KEY = 'quantumpay_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// Authenticated fetch wrapper
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    // Try parse JSON error body, otherwise fall back to text for clearer messages
    let message = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && (errorData.message || Object.keys(errorData).length)) {
        message = errorData.message || JSON.stringify(errorData);
      }
    } catch (e) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch {
        /* swallow */
      }
    }

    throw new Error(message);
  }

  return response.json();
}
