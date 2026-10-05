// Authentication reset utility
export const resetAuth = () => {
  // Clear all possible token storage locations
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Clear any other auth-related data
  localStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminToken');
  
  console.log('Authentication data cleared');
  
  // Redirect to homepage for re-authentication
  window.location.href = '/';
};

// Check if user has valid authentication
export const checkAuthStatus = () => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('user');
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: !!(token && user)
  };
};