import { UserProfile } from '../types';

/**
 * Configuration for FastAPI backend connection.
 * By default points to standard local FastAPI server at port 8000,
 * or can be set via VITE_API_URL in .env.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

const TOKEN_KEY = 'sakura_access_token';
const USER_KEY = 'sakura_user_profile';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
  
  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: UserProfile): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: (): void => localStorage.removeItem(USER_KEY),

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Returns authorization headers with Bearer token for protected API calls
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = authStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * Authentication service matching your FastAPI router endpoints:
 * 1. POST /token (OAuth2PasswordRequestForm with urlencoded username and password)
 * 2. POST /register (JSON with email and password)
 */
export const authApi = {
  /**
   * Log in via FastAPI /token endpoint (OAuth2PasswordRequestForm standard)
   */
  async login(emailOrUsername: string, password: string): Promise<{ token: TokenResponse; user: UserProfile }> {
    try {
      // FastAPI OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', emailOrUsername);
      formData.append('password', password);

      const res = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(errorData.detail || 'Wrong email or password');
      }

      const tokenData: TokenResponse = await res.json();
      authStorage.setToken(tokenData.access_token);

      // Create or populate user profile from email
      const userProfile: UserProfile = {
        id: 'user_' + Date.now(),
        name: emailOrUsername.split('@')[0] || 'Learner',
        email: emailOrUsername,
        avatarChar: (emailOrUsername.charAt(0) || '学').toUpperCase(),
        jlptGoal: 'JLPT N4',
        streakDays: 1,
        kanjiLearned: 14,
      };

      authStorage.setUser(userProfile);
      return { token: tokenData, user: userProfile };
    } catch (err: any) {
      // If FastAPI server is not reachable locally yet, fallback cleanly to client simulation
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('FastAPI backend not running at ' + API_BASE_URL + '. Simulating login session for frontend preview.');
        const mockToken = { access_token: 'mock_jwt_' + Date.now(), token_type: 'bearer' };
        const mockUser: UserProfile = {
          id: 'user_local',
          name: emailOrUsername.split('@')[0] || 'Learner',
          email: emailOrUsername,
          avatarChar: (emailOrUsername.charAt(0) || '学').toUpperCase(),
          jlptGoal: 'JLPT N4',
          streakDays: 1,
          kanjiLearned: 14,
        };
        authStorage.setToken(mockToken.access_token);
        authStorage.setUser(mockUser);
        return { token: mockToken, user: mockUser };
      }
      throw err;
    }
  },

  /**
   * Register via FastAPI /register endpoint (RegisterRequest JSON schema)
   */
  async register(email: string, password: string, name?: string): Promise<{ token: TokenResponse; user: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Registration failed');
      }

      const tokenData: TokenResponse = await res.json();
      authStorage.setToken(tokenData.access_token);

      const userProfile: UserProfile = {
        id: 'user_' + Date.now(),
        name: name || email.split('@')[0] || 'New Learner',
        email: email,
        avatarChar: (name?.charAt(0) || email.charAt(0) || '学').toUpperCase(),
        jlptGoal: 'JLPT N5',
        streakDays: 1,
        kanjiLearned: 5,
      };

      authStorage.setUser(userProfile);
      return { token: tokenData, user: userProfile };
    } catch (err: any) {
      // If backend not running, fallback to client preview
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('FastAPI backend not running at ' + API_BASE_URL + '. Simulating registration session for frontend preview.');
        const mockToken = { access_token: 'mock_jwt_' + Date.now(), token_type: 'bearer' };
        const mockUser: UserProfile = {
          id: 'user_local',
          name: name || email.split('@')[0] || 'New Learner',
          email: email,
          avatarChar: (name?.charAt(0) || email.charAt(0) || '学').toUpperCase(),
          jlptGoal: 'JLPT N5',
          streakDays: 1,
          kanjiLearned: 5,
        };
        authStorage.setToken(mockToken.access_token);
        authStorage.setUser(mockUser);
        return { token: mockToken, user: mockUser };
      }
      throw err;
    }
  },

  /**
   * Log out and clear token
   */
  logout(): void {
    authStorage.clearAll();
  }
};
