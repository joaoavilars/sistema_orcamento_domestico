import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { isAdmin, logout } from '../../services/authService'; 

const Navbar = () => {
  // 'light' ou 'dark'
  const [theme, setTheme] = useState(
    // 1. Tenta ler do localStorage
    localStorage.getItem('theme') ||
    // 2. Tenta ler a preferência do sistema
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  const userIsAdmin = isAdmin(); // <-- Verifica se o usuário é admin
  const handleLogout = () => {
    logout();
    window.location.href = '/login'; // Força o re-render
  };
  // Efeito para aplicar a classe no HTML e salvar no localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const linkClass = "px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClass = "bg-gray-900 text-white dark:bg-gray-700";
  const inactiveLinkClass = "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-gray-900 dark:text-white font-bold">
              Meu Orçamento
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink
                  to="/transacoes"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  Transações
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/categorias"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  Categorias
                </NavLink>
                <NavLink
                    to="/admin/usuarios"
                    className={({ isActive }) =>
                      `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                    }
                  >
                    Usuários
                  </NavLink>
              </div>
            </div>
          </div>
          
          {/* Botão de Alternar Tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
          <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Sair"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;