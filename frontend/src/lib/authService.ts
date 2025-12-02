import { LoginRequest, RegisterRequest, LoginResponse } from '@/@types/auth';
import { User } from '@/@types/user';

const API_BASE_URL = typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:8080`
  : 'http://localhost:8080';

class AuthService {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const loginResponse: LoginResponse = await response.json();
    
    // Store token and user in localStorage
    this.setToken(loginResponse.token);
    this.setUser(loginResponse.user);

    return loginResponse;
  }

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const user = await response.json();
    this.setUser(user);
    return user;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AuthService.TOKEN_KEY);
      localStorage.removeItem(AuthService.USER_KEY);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AuthService.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AuthService.TOKEN_KEY, token);
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(AuthService.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = new AuthService();
