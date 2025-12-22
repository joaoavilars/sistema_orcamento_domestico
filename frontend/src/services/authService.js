import api from './api';

export const TOKEN_KEY = "@orcamento-app-token";
export const ROLE_KEY = "@orcamento-app-role";
export const USER_KEY = "user"; // Para guardar infos do user

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(ROLE_KEY, response.data.user.role);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('selectedFamily');
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getRole() === 'admin';