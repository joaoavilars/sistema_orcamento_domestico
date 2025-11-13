import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Views Principais
import Transacoes from './views/Transacoes';
import Dashboard from './views/Dashboard';
import Categorias from './views/Categorias';
import Usuarios from './views/Usuarios'; // View de admin

// Views de Auth
import Login from './views/Login';
// A view Register não é mais usada publicamente

// Layout e Proteção
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componente de Layout Principal (para ter a Navbar)
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* O Outlet renderiza o componente da rota filha (Transacoes, Dashboard, etc) */}
      <Outlet />
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Envolvidas pelo "guarda" ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          {/* O MainLayout (com Navbar) só é renderizado para rotas protegidas */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/transacoes" replace />} />
            <Route path="/transacoes" element={<Transacoes />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            
            {/* Rota "Catch-all" para rotas logadas que não existem (ex: /asdf) */}
            <Route path="*" element={<Navigate to="/transacoes" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;