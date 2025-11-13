import React, { useState } from 'react';
import api from '../services/api';

const ModalEditarUsuario = ({ usuario, familias, onClose, onSuccess }) => {
  // Estado para os campos controlados
  const [password, setPassword] = useState('');
  // Inicia com o ID da família atual, ou 'sem-familia'
  const [familiaId, setFamiliaId] = useState(usuario.familia_id || 'sem-familia');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {};
    if (password) {
      if (password.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres.');
        setLoading(false);
        return;
      }
      payload.password = password; // Só envia se for preenchido
    }
    
    // Converte 'sem-familia' para null
    payload.familia_id = familiaId === 'sem-familia' ? null : parseInt(familiaId);
    
    // Se o usuário é admin, não deve ter família
    if(usuario.role === 'admin' && payload.familia_id !== null) {
        setError('Administradores não podem pertencer a famílias.');
        setLoading(false);
        return;
    }

    try {
      // /api/admin/users/:id
      await api.put(`/admin/users/${usuario.id}`, payload);
      onSuccess(); // Sucesso, avisa o pai para fechar e recarregar
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar usuário.');
    } finally {
      setLoading(false);
    }
  };

  // --- O RETURN CORRIGIDO COMEÇA AQUI ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold dark:text-gray-200">
            Editar Usuário: {usuario.email}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div>
            <label 
              htmlFor="edit-password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nova Senha (Deixe em branco para não alterar)
            </label>
            <input
              type="password"
              id="edit-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>

          <div>
            <label 
              htmlFor="edit-familia" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Família
            </label>
            <select
              id="edit-familia"
              value={familiaId}
              onChange={(e) => setFamiliaId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={usuario.role === 'admin'} // Desabilita para o admin
            >
              <option value="sem-familia">-- Nenhuma --</option>
              {familias.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
            {usuario.role === 'admin' && (
                <p className="text-xs text-gray-500 mt-1">Admins não podem ter famílias.</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;