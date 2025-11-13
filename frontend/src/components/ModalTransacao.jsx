import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ModalTransacao = ({ tipo, onClose, onSuccess, transacaoParaEditar }) => {
  const [nome, setNome] = useState(transacaoParaEditar?.nome || '');
  const [valor, setValor] = useState(transacaoParaEditar?.valor || '');
  
  const dataInicial = transacaoParaEditar?.data_transacao 
    ? new Date(transacaoParaEditar.data_transacao).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const [data, setData] = useState(dataInicial);
  const [categoriaId, setCategoriaId] = useState(transacaoParaEditar?.categoria_id || '');
  const [status, setStatus] = useState(transacaoParaEditar?.status || 'pendente');
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isEdicao = !!transacaoParaEditar;

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        const cats = response.data || [];
        setCategorias(cats);

        if (!isEdicao && cats.length > 0) {
          setCategoriaId(cats[0].id);
        } else if (isEdicao && transacaoParaEditar.categoria_id) {
            setCategoriaId(String(transacaoParaEditar.categoria_id));
        }
      } catch (err) {
        console.error("Erro ao buscar categorias para o modal:", err);
      }
    };
    fetchCategorias();
  }, [isEdicao, transacaoParaEditar]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const tipoDaTransacao = isEdicao ? transacaoParaEditar.tipo : tipo;

    const payload = {
      nome,
      valor: parseFloat(valor),
      data_transacao: new Date(data),
      categoria_id: parseInt(categoriaId),
      tipo: tipoDaTransacao,
      status: tipoDaTransacao === 'receita' ? 'recebido' : status,
    };
    
    // Validação extra
    if (!payload.nome || !payload.valor || !payload.categoria_id) {
        setError("Nome, Valor e Categoria são obrigatórios.");
        setLoading(false);
        return;
    }

    try {
      let response;
      if (isEdicao) {
        response = await api.put(`/transacoes/${transacaoParaEditar.id}`, payload);
      } else {
        response = await api.post('/transacoes', payload);
      }
      onSuccess(response.data, isEdicao);
    } catch (err) {
      setError('Erro ao salvar. Verifique os campos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const title = isEdicao 
    ? 'Editar Transação' 
    : (tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa');

  const tipoFinal = isEdicao ? transacaoParaEditar.tipo : tipo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        
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
          
          {/* --- CAMPOS DO FORMULÁRIO (CORRIGIDOS) --- */}
          <div>
            <label htmlFor="nome-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input
              type="text"
              id="nome-transacao"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="valor-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
              <input
                type="number"
                id="valor-transacao"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="data-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input
                type="date"
                id="data-transacao"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="categoria-transacao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select
              id="categoria-transacao"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              {categorias.length === 0 ? (
                 <option disabled value="">Carregando...</option>
              ) : (
                <option value="">Selecione...</option> // Valor vazio para validação
              )}
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          {/* --- FIM DOS CAMPOS DO FORMULÁRIO --- */}

          { tipoFinal === 'despesa' && (
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
          
          {/* --- BOTÕES (CORRIGIDOS) --- */}
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTransacao;