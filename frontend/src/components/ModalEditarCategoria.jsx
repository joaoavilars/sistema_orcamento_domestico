import React, { useState } from 'react';
import api from '../services/api';

const ModalEditarCategoria = ({ categoria, onClose, onSuccess }) => {
  // Inicia o estado com os dados da categoria que está sendo editada
  const [nome, setNome] = useState(categoria.nome);
  const [cor, setCor] = useState(categoria.cor_hex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { nome, cor_hex: cor };
      // Chama a nova rota PUT
      const response = await api.put(`/categorias/${categoria.id}`, payload);
      onSuccess(response.data); // Envia a categoria atualizada de volta
    } catch (err) {
      setError('Erro ao salvar. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold dark:text-gray-200">
            Editar Categoria
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
              htmlFor="nome-edit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nome
            </label>
            <input
              type="text"
              id="nome-edit"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          <div>
            <label
              htmlFor="cor-edit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Cor
            </label>
            <input
              type="color"
              id="cor-edit"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              required
              className="mt-1 block w-full rounded-md h-10" // Aumenta a altura
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarCategoria;