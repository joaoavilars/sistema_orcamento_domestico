import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Views Principais
import Transacoes from './views/Transacoes';
import Busca from './views/Busca';
import Dashboard from './views/Dashboard';
import Categorias from './views/Categorias';
import Usuarios from './views/Usuarios';

// Views de Auth
import Login from './views/Login';

// Layout e Proteção
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// O "Molde" (Navbar + Fundo)
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
      <Outlet /> {/* O Outlet renderiza a página (Transacoes, Dashboard, etc.) */}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* --- ESTRUTURA DE ROTA CORRETA --- */}
        {/* 1. O "Guarda" (ProtectedRoute) vem por fora */}
        <Route element={<ProtectedRoute />}>

          {/* 2. O "Molde" (MainLayout) vem por dentro do guarda */}
          <Route element={<MainLayout />}>

            {/* 3. As "Páginas" vêm por dentro do molde */}
            <Route path="/" element={<Navigate to="/transacoes" replace />} />
            <Route path="/transacoes" element={<Transacoes />} />
            <Route path="/busca" element={<Busca />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/admin/usuarios" element={<Usuarios />} />
          </Route>
        </Route>

        {/* Rota "Catch-all": Se não achar nada, manda pro login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;