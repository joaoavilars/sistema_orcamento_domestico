import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrashIcon } from '@heroicons/react/24/outline';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário de registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default para novo usuário
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users'); // Rota de admin
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    
    try {
      // /api/admin/register
      const response = await api.post('/admin/register', { email, password, role });
      setSuccess(`Usuário ${email} criado com sucesso!`);
      setEmail('');
      setPassword('');
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      setError('Erro ao registrar. Email já pode estar em uso.');
    }
  };
  
  const handleDelete = async (userId, userEmail) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?`)) {
        return;
    }
    
    try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers(); // Recarrega a lista
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert(error.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna 1: Formulário de Novo Usuário */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Cadastrar Novo Usuário
          </h2>
          <form
            onSubmit={handleRegister}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
          >
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Senha (mín. 8 caracteres)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="role">Role (Permissão)</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="user">Usuário Padrão</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Cadastrar Usuário
            </button>
          </form>
        </div>

        {/* Coluna 2: Lista de Usuários */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Usuários Existentes
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {loading ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">Carregando...</p>
            ) : (
              <ul className="divide-y dark:divide-gray-700">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium dark:text-gray-200">{user.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role: <span className="font-semibold">{user.role}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;