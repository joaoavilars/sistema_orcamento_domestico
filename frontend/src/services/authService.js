import api from './api';

export const TOKEN_KEY = "@orcamento-app-token";
export const ROLE_KEY = "@orcamento-app-role";
export const USER_KEY = "user"; // Para guardar infos do user
export const REMEMBER_ME_KEY = "@orcamento-app-remember";
export const REMEMBERED_EMAIL_KEY = "@orcamento-app-remembered-email";
export const REMEMBERED_PASSWORD_KEY = "@orcamento-app-remembered-password";

export const login = async (email, password, rememberMe = false) => {
  const response = await api.post('/login', { email, password });
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(ROLE_KEY, response.data.user.role);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  
  // Salva a preferência de memorizar credenciais
  if (rememberMe) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    localStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
  }
};

export const logout = () => {
  const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('selectedFamily');
  
  // Se não estiver marcado para memorizar, remove as credenciais salvas
  if (!shouldRemember) {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
  }
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);
export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getRole() === 'admin';

// Funções para gerenciar credenciais memorizadas
export const getRememberedCredentials = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  if (rememberMe) {
    return {
      email: localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
      password: localStorage.getItem(REMEMBERED_PASSWORD_KEY) || '',
      rememberMe: true
    };
  }
  return { email: '', password: '', rememberMe: false };
};

export const shouldRememberMe = () => localStorage.getItem(REMEMBER_ME_KEY) === 'true';