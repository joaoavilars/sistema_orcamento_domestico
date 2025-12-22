import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { isAdmin, logout } from '../../services/authService';

const Navbar = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const linkClass = "px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClass = "bg-gray-900 text-white dark:bg-gray-700";
  const inactiveLinkClass = "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";
  const mobileLinkClass = "block px-3 py-2 rounded-md text-base font-medium";
  const mobileActiveClass = "bg-gray-900 text-white dark:bg-gray-700";
  const mobileInactiveClass = "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700";

  return (
    // --- MUDANÇA: Adicionado 'print:hidden' ---
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center">
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Abrir menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="flex-shrink-0 text-gray-900 dark:text-white font-bold ml-3 md:ml-0">
              ContaJunto
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/transacoes" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Transações</NavLink>
                <NavLink to="/busca" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Busca</NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Dashboard</NavLink>
                <NavLink to="/categorias" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Categorias</NavLink>
                {userIsAdmin && (
                  <NavLink to="/admin/usuarios" className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Usuários</NavLink>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLink to="/transacoes" className={({ isActive }) => `${mobileLinkClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`}>Transações</NavLink>
          <NavLink to="/busca" className={({ isActive }) => `${mobileLinkClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`}>Busca</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `${mobileLinkClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`}>Dashboard</NavLink>
          <NavLink to="/categorias" className={({ isActive }) => `${mobileLinkClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`}>Categorias</NavLink>
          {userIsAdmin && (
            <NavLink to="/admin/usuarios" className={({ isActive }) => `${mobileLinkClass} ${isActive ? mobileActiveClass : mobileInactiveClass}`}>Usuários</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;