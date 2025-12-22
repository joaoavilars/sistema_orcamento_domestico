import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// Importa os novos modais
import ModalFamilia from '../components/ModalFamilia';
import ModalEditarUsuario from '../components/ModalEditarUsuario';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [familias, setFamilias] = useState([]); // <-- Lista de famílias
  const [loading, setLoading] = useState(true);

  // Estados para o formulário de NOVO usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [familiaId, setFamiliaId] = useState('sem-familia'); // 'sem-familia' ou ID
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para os MODAIS
  const [showFamiliaModal, setShowFamiliaModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);

  // --- Funções de API ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Carrega usuários e famílias em paralelo
      const [usersRes, familiasRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/familias')
      ]);
      setUsers(usersRes.data || []);
      setFamilias(familiasRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Handlers de Cadastro de Usuário ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    const payload = {
      nome,
      email,
      password,
      role,
      familia_id: familiaId === 'sem-familia' ? null : parseInt(familiaId)
    };

    try {
      await api.post('/admin/register', payload); // Rota de admin
      setSuccess(`Usuário ${email} criado com sucesso!`);
      setNome('');
      setEmail('');
      setPassword('');
      setRole('user');
      setFamiliaId('sem-familia');
      fetchAllData(); // Recarrega a lista
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar.');
    }
  };

  // --- Handlers de Exclusão de Usuário ---
  const handleDelete = async (userId, userEmail) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAllData(); // Recarrega a lista
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  // --- Handlers dos Modais ---
  const handleAbrirEditarModal = (usuario) => {
    setUsuarioParaEditar(usuario);
    setShowEditarModal(true);
  };

  const handleSucessoFamilia = (novaFamilia) => {
    // Adiciona a nova família à lista e fecha o modal
    setFamilias([...familias, novaFamilia]);
    // Seleciona a família recém-criada no dropdown
    setFamiliaId(novaFamilia.id);
    setShowFamiliaModal(false);
  };

  const handleSucessoEdicao = () => {
    setShowEditarModal(false);
    setUsuarioParaEditar(null);
    fetchAllData(); // Recarrega tudo
  };

  // --- O RETURN CORRIGIDO COMEÇA AQUI ---
  return (
    <>
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
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Senha (mín. 8 caracteres)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Role (Permissão)
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="user">Usuário Padrão</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* --- SEU CAMPO DE FAMÍLIA COM O BOTÃO + --- */}
            <div>
              <label htmlFor="familia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Família
              </label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  id="familia"
                  value={familiaId}
                  onChange={(e) => setFamiliaId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  disabled={role === 'admin'}
                >
                  <option value="sem-familia">-- Nenhuma --</option>
                  {familias.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowFamiliaModal(true)}
                  className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  aria-label="Cadastrar nova família"
                >
                  +
                </button>
              </div>
              {role === 'admin' && (
                <p className="text-xs text-gray-500 mt-1">Admins não podem ter famílias.</p>
              )}
            </div>
            {/* --- FIM DO CAMPO DE FAMÍLIA --- */}

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
                  <li key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-gray-200">{user.nome} ({user.email})</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role: <span className="font-semibold">{user.role}</span>
                        {/* Mostra o nome da família se ela existir */}
                        {user.familia && (
                          <> | Família: <span className="font-semibold">{user.familia.nome}</span></>
                        )}
                      </p>
                    </div>
                    {/* --- BOTÕES DE AÇÃO --- */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAbrirEditarModal(user)}
                        className="text-gray-400 hover:text-indigo-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* --- RENDERIZAÇÃO DOS MODAIS --- */}
      {showFamiliaModal && (
        <ModalFamilia
          onClose={() => setShowFamiliaModal(false)}
          onSuccess={handleSucessoFamilia}
        />
      )}

      {showEditarModal && usuarioParaEditar && (
        <ModalEditarUsuario
          usuario={usuarioParaEditar}
          familias={familias}
          onClose={() => setShowEditarModal(false)}
          onSuccess={handleSucessoEdicao}
        />
      )}
    </>
  );
};

export default Usuarios;