import { API_URL } from '../config';

export class AuthService {
  static signInWithGoogle() {
    window.location.href = `${API_URL}/api/auth/google`;
  }

  static signInWithOAuth(_provider: 'google' | 'facebook' | 'apple') {
    window.location.href = `${API_URL}/api/auth/google`;
  }

  static async handleOAuthCallback(): Promise<{ user: any; error: any }> {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userParam = params.get('user');
      if (token && userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        return { user, error: null };
      }
      return { user: null, error: { message: 'No auth data in callback' } };
    } catch (err) {
      return { user: null, error: err };
    }
  }

  static async signOut() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { error: null };
  }

  static async getCurrentUser() {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    if (token && user) return JSON.parse(user);
    return null;
  }
}
