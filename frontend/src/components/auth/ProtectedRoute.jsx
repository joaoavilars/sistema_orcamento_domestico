import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../../services/authService';

const ProtectedRoute = () => {
  if (!isLoggedIn()) {
    // Usuário não logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Usuário logado, renderiza o componente filho (Transacoes, Dashboard, etc.)
  return <Outlet />;
};

export default ProtectedRoute;