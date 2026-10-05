// Centralized token storage utility
export const tokenStorage = {
  getToken: (): string | null => {
    return sessionStorage.getItem('token');
  },
  
  setToken: (token: string): void => {
    sessionStorage.setItem('token', token);
  },
  
  removeToken: (): void => {
    sessionStorage.removeItem('token');
  },
  
  getUser: (): any | null => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: any): void => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  
  removeUser: (): void => {
    sessionStorage.removeItem('user');
  },
  
  clearAll: (): void => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};