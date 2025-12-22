import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TransacaoItem from '../components/TransacaoItem';
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const Busca = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [categorias, setCategorias] = useState([]);
  const [filtroCategorias, setFiltroCategorias] = useState([]); // Array de IDs
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  // Datas (Padrão: Começo e Fim do Ano Atual)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(startOfYear);
  const [dataFim, setDataFim] = useState(endOfYear);

  // Totalizadores
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [saldoPeriodo, setSaldoPeriodo] = useState(0);

  const fetchTransacoes = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get('/transacoes', {
        params: {
          start_date: dataInicio,
          end_date: dataFim
        }
      });
      setTransacoes(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  // Efeito para buscar ao montar a tela ou mudar as datas

  useEffect(() => {
    fetchTransacoes();
    fetchCategorias();
  }, [fetchTransacoes, fetchCategorias]);

  // Filtragem local (após receber do backend por data)
  const transacoesFiltradas = transacoes.filter((t) => {
    const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;

    // Filtro de Categorias (Multi-select)
    const matchCategoria = filtroCategorias.length === 0 || filtroCategorias.includes(t.categoria_id);

    let matchStatus = true;
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'pendente') {
        matchStatus = t.status === 'pendente';
      } else if (filtroStatus === 'pago') {
        matchStatus = t.status === 'pago' || t.status === 'recebido';
      }
    }
    return matchBusca && matchTipo && matchStatus && matchCategoria;
  });

  // Cálculo dos totais
  useEffect(() => {
    let rec = 0;
    let desp = 0;

    transacoesFiltradas.forEach(t => {
      if (t.tipo === 'receita') rec += t.valor;
      else desp += t.valor;
    });

    setTotalReceitas(rec);
    setTotalDespesas(desp);
    setSaldoPeriodo(rec - desp);
  }, [transacoesFiltradas]);

  return (
    <div className="container mx-auto pb-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <MagnifyingGlassIcon className="h-7 w-7 text-indigo-600" />
          Busca Avançada
        </h1>

        <div className="flex flex-col gap-4">

          {/* Barra de Pesquisa */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg transition-shadow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro Data Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Filtro Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  // max={endOfYear} /* Removido para permitir busca em qualquer ano */
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>
            </div>

            {/* Filtro Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago/Recebido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtro de Categorias (Multi-Select Customizado) */}
          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categorias</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <span className="flex items-center gap-2 truncate">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                  {filtroCategorias.length === 0
                    ? <span className="text-gray-500 dark:text-gray-400">Todas as categorias</span>
                    : <span className="text-gray-900 dark:text-white">{filtroCategorias.length} selecionada(s)</span>
                  }
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </button>

              {isCatDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  <div
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    onClick={() => setFiltroCategorias([])}
                  >
                    <span className={`block truncate ${filtroCategorias.length === 0 ? 'font-semibold' : 'font-normal'}`}>
                      Todas
                    </span>
                  </div>
                  {categorias.map((cat) => (
                    <div
                      key={cat.id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      onClick={() => {
                        setFiltroCategorias(prev => {
                          if (prev.includes(cat.id)) {
                            return prev.filter(id => id !== cat.id);
                          } else {
                            return [...prev, cat.id];
                          }
                        });
                      }}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtroCategorias.includes(cat.id)}
                          readOnly
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                        />
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.cor_hex }}></div>
                        <span className={`block truncate ${filtroCategorias.includes(cat.id) ? 'font-semibold' : 'font-normal'}`}>
                          {cat.nome}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Visualização das tags selecionadas */}
            {filtroCategorias.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {categorias.filter(c => filtroCategorias.includes(c.id)).map(cat => (
                  <span key={cat.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {cat.nome}
                    <button
                      type="button"
                      onClick={() => setFiltroCategorias(prev => prev.filter(id => id !== cat.id))}
                      className="ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-500 focus:outline-none"
                    >
                      <span className="sr-only">Remover {cat.nome}</span>
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setFiltroCategorias([])}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

        </div>
        {/* Resumo dos Resultados */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Receitas</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Despesas</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${saldoPeriodo >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
            <p className={`text-sm font-medium ${saldoPeriodo >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>Saldo no Período</p>
            <p className={`text-xl font-bold ${saldoPeriodo >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
              {saldoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

      </div>

      {/* Lista de Resultados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Resultados</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {transacoesFiltradas.length} ite{transacoesFiltradas.length !== 1 ? 'ns' : 'm'}
          </span>
        </div>

        <div className="flex flex-col">
          {loading ? (
            <p className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Buscando transações...</p>
          ) : transacoesFiltradas.length > 0 ? (
            transacoesFiltradas.map((trans, index) => (
              <TransacaoItem
                key={trans.id}
                transacao={trans}
                isLast={index === transacoesFiltradas.length - 1}
              // Para a busca, talvez não queiramos permitir edição/exclusão direta ou precisamos passar as funções handlers se quisermos.
              // Por enquanto, vou omitir onEdit/onDelete para ser apenas visualização ou passaria props vazias se o componente exigir.
              // Se o usuário quiser editar, ele vai na tela de transações. 
              // Mas se for crucial, teríamos que duplicar a lógica de modais aqui.
              // Pela descrição do user "Busca", geralmente é leitura. Vou deixar sem ações por enquanto para simplificar.
              />
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>Nenhuma transação encontrada com estes filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default Busca;
