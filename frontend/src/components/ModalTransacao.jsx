import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- CORREÇÃO: A função formatCurrency TEM que estar aqui ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
// -----------------------------------------------------------

const ModalTransacao = ({ tipo, onClose, onSuccess, transacaoParaEditar, dataPadrao }) => {
  const [nome, setNome] = useState(transacaoParaEditar?.nome || '');
  const [valor, setValor] = useState(transacaoParaEditar?.valor || '');

  const dataInicial = transacaoParaEditar?.data_transacao
    ? new Date(transacaoParaEditar.data_transacao).toISOString().split('T')[0]
    : (dataPadrao || new Date().toISOString().split('T')[0]);

  const [data, setData] = useState(dataInicial);
  const [categoriaId, setCategoriaId] = useState(transacaoParaEditar?.categoria_id || '');
  const [status, setStatus] = useState(transacaoParaEditar?.status || 'pendente');

  // Parcelamento
  const [isParcelado, setIsParcelado] = useState(false);
  const [qtdParcelas, setQtdParcelas] = useState(2);

  // Edição em Lote
  const [editMode, setEditMode] = useState('single');

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdicao = !!transacaoParaEditar;
  const isRecorrente = isEdicao && !!transacaoParaEditar.group_id;

  const tipoFinal = isEdicao ? transacaoParaEditar.tipo : tipo;
  const isReceita = tipoFinal === 'receita';

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
        console.error("Erro ao buscar categorias:", err);
      }
    };
    fetchCategorias();
  }, [isEdicao, transacaoParaEditar]);

  useEffect(() => {
    if (!isEdicao && dataPadrao) {
      setData(dataPadrao);
    }
  }, [isEdicao, dataPadrao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      nome,
      valor: parseFloat(valor),
      data_transacao: new Date(data),
      categoria_id: parseInt(categoriaId),
      tipo: tipoFinal,
      status: status,
      is_parcelado: !isEdicao && isParcelado,
      qtd_parcelas: parseInt(qtdParcelas),
      edit_mode: editMode
    };

    if (!payload.nome || !payload.valor || !payload.categoria_id) {
      setError("Preencha todos os campos obrigatórios.");
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
      setError('Erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const title = isEdicao
    ? 'Editar Transação'
    : (isReceita ? 'Nova Receita' : 'Nova Despesa');

  const statusConcluido = isReceita ? 'recebido' : 'pago';
  const labelCheckbox = isReceita ? 'Já foi recebido?' : 'Já foi pago?';
  const isChecked = status === 'pago' || status === 'recebido';

  // Cálculo do Total
  const valorNum = parseFloat(valor) || 0;
  const totalParcelado = valorNum * qtdParcelas;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold dark:text-gray-200">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Opções de Edição em Lote */}
          {isRecorrente && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                É parcelada?
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="editMode" value="single" checked={editMode === 'single'} onChange={(e) => setEditMode(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Alterar apenas esta</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="editMode" value="future" checked={editMode === 'future'} onChange={(e) => setEditMode(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Alterar esta e as futuras</span>
                </label>
              </div>
            </div>
          )}

          {/* Opção de Parcelamento na Criação */}
          {!isEdicao && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <label htmlFor="isParcelado" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                  É parcelada?
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="isParcelado"
                    checked={isParcelado}
                    onChange={(e) => setIsParcelado(e.target.checked)}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5"
                    style={{ right: isParcelado ? '0' : 'auto', left: isParcelado ? 'auto' : '0' }}
                  />
                  <label
                    htmlFor="isParcelado"
                    className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isParcelado ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              {isParcelado && (
                <div className="mt-3 animate-fade-in-down">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Quantidade de Parcelas
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="120"
                    value={qtdParcelas}
                    onChange={(e) => setQtdParcelas(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  />
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold text-right">
                    {/* O ERRO ESTAVA AQUI: chamava a função que não existia */}
                    Total Estimado: {formatCurrency(totalParcelado)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isParcelado ? 'Valor da Parcela' : 'Valor (R$)'}
              </label>
              <input type="number" id="valor" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
            </div>
            <div className="flex-1">
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input type="date" id="data" value={data} onChange={(e) => setData(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
            </div>
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select id="categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              {categorias.length === 0 ? <option disabled>Carregando...</option> : <option value="">Selecione...</option>}
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" id="status" checked={isChecked} onChange={(e) => setStatus(e.target.checked ? statusConcluido : 'pendente')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer" />
            <label htmlFor="status" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">{labelCheckbox}</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalTransacao;