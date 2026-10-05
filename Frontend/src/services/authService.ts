import { API_URL } from '../config';

export class AuthService {
  static signInWithGoogle() {
    window.location.href = `${API_URL}/api/auth/google`;
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
