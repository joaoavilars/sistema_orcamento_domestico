import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { login, getRememberedCredentials } from '../services/authService';

const Login = () => {
  const remembered = getRememberedCredentials();
  const [email, setEmail] = useState(remembered.email);
  const [password, setPassword] = useState(remembered.password);
  const [rememberMe, setRememberMe] = useState(remembered.rememberMe);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Garante que o tema dark seja aplicado quando a página carregar
    const savedTheme = localStorage.getItem('theme');
    // Dark como padrão se não houver preferência salva
    const theme = savedTheme || 'dark';
    
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salva o tema padrão se não existir
    if (!savedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, rememberMe);
      navigate('/transacoes'); // Redireciona para a home
    } catch (err) {
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Entrar
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 pr-10 bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Memorizar credenciais
            </label>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;