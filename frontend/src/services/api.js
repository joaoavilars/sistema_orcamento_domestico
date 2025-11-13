import axios from 'axios';
import { getToken, logout } from './authService'; // Importa o helper

const api = axios.create({
  baseURL: '/api',
});

// --- NOVO INTERCEPTOR ---
api.interceptors.request.use(async (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opcional: Interceptor para deslogar em caso de token expirado (Erro 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logout();
      // Recarrega a página, o ProtectedRoute vai redirecionar para /login
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);
// --- FIM DO INTERCEPTOR ---

export default api;