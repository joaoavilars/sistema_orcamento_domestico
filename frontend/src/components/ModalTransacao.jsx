import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Este é um modal básico. Em produção, use uma lib como Headless UI ou Radix.
const ModalTransacao = ({ tipo, onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [categoriaId, setCategoriaId] = useState('');
  const [status, setStatus] = useState('pendente');

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- MUDANÇA PRINCIPAL AQUI ---
  // Busca categorias da API real, e não mais do mock.
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        const cats = response.data || [];
        setCategorias(cats);

        // Auto-seleciona a primeira categoria se ela existir
        if (cats.length > 0) {
          setCategoriaId(cats[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar categorias para o modal:", err);
      }
    };

    fetchCategorias();
  }, []); // O array vazio [] faz isso rodar 1x quando o modal é aberto.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      nome,
      valor: parseFloat(valor),
      data_transacao: new Date(data), // Envia como objeto Date
      categoria_id: parseInt(categoriaId),
      tipo: tipo,
      status: tipo === 'receita' ? 'recebido' : status,
    };

    try {
      const response = await api.post('/transacoes', payload);
      onSuccess(response.data); // Retorna a nova transação
    } catch (err) {
      setError('Erro ao salvar. Verifique os campos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const title = tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      {/* ADICIONADO 'dark:bg-gray-800' AQUI */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        
        {/* ADICIONADO 'dark:border-gray-700' e 'dark:text-gray-200' */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold dark:text-gray-200">{title}</h3>
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
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
              <input
                type="number"
                id="valor"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input
                type="date"
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              {categorias.length === 0 && (
                <option disabled>Nenhuma categoria</option>
              )}
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          {tipo === 'despesa' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                checked={status === 'pago'}
                onChange={(e) => setStatus(e.target.checked ? 'pago' : 'pendente')}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="status" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Já foi pago?</label>
            </div>
          )}
          
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTransacao;