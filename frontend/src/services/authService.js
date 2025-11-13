import api from './api';

export const TOKEN_KEY = "@orcamento-app-token";
export const ROLE_KEY = "@orcamento-app-role"; // <-- Nova chave

// Atualiza o login para salvar o token E a role
export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(ROLE_KEY, response.data.role); // <-- Salva a role
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY); // <-- Remove a role
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRole = () => { // <-- Nova função
  return localStorage.getItem(ROLE_KEY);
};

export const isLoggedIn = () => {
  const token = getToken();
  return !!token;
};

export const isAdmin = () => { // <-- Nova função
  return getRole() === 'admin';
};