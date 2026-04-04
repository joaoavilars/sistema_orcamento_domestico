import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ModalTransacao from '../components/ModalTransacao';
import TransacaoItem from '../components/TransacaoItem';
import FiltroMesAno from '../components/FiltroMesAno';
import PrintButton from '../components/PrintButton';
import ExportButton from '../components/ExportButton';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon, TagIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const [categorias, setCategorias] = useState([]);
  const [filtroCategorias, setFiltroCategorias] = useState([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const [contas, setContas] = useState([]);
  const [filtroContas, setFiltroContas] = useState([]);
  const [isContaDropdownOpen, setIsContaDropdownOpen] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('despesa');
  const [transacaoParaAcao, setTransacaoParaAcao] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState('single');

  // Modal pagamento em massa
  const [isPagarEmMassaModalOpen, setIsPagarEmMassaModalOpen] = useState(false);
  const [transacaoParaPagar, setTransacaoParaPagar] = useState(null);

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());

  const fetchTransacoes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/transacoes?mes=${mesFiltro}&ano=${anoFiltro}`
      );
      setTransacoes(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  }, [mesFiltro, anoFiltro]);

  const dataPadraoModal = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Se estiver no mês/ano corrente, sugere o dia de hoje
    if (mesFiltro === currentMonth && anoFiltro === currentYear) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Caso contrário, sugere o dia 01 do mês do filtro
    const m = String(mesFiltro).padStart(2, '0');
    const a = String(anoFiltro);
    return `${a}-${m}-01`;
  }, [mesFiltro, anoFiltro]);

  useEffect(() => {
    fetchTransacoes();

    // Buscar categorias para o filtro
    api.get('/categorias').then(res => {
      setCategorias(res.data || []);
    }).catch(err => console.error("Erro ao buscar categorias:", err));

    // Buscar contas para o filtro
    api.get('/contas').then(res => {
      setContas(res.data || []);
    }).catch(err => console.error("Erro ao buscar contas:", err));

  }, [fetchTransacoes]);

  const transacoesFiltradas = transacoes.filter((t) => {
    const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;

    // Filtro de Categorias (Multi-select)
    const matchCategoria = filtroCategorias.length === 0 || filtroCategorias.includes(t.categoria_id);

    // Filtro de Contas (Multi-select) — 0 representa "sem conta vinculada"
    const matchConta = filtroContas.length === 0 || filtroContas.includes(t.conta_id ?? 0);

    let matchStatus = true;
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'pendente') {
        matchStatus = t.status === 'pendente';
      } else if (filtroStatus === 'pago') {
        matchStatus = t.status === 'pago' || t.status === 'recebido';
      }
    }
    return matchBusca && matchTipo && matchStatus && matchCategoria && matchConta;
  });

  const temFiltroAtivo = busca !== '' || filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroCategorias.length > 0 || filtroContas.length > 0;

  const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
  const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
  const totalLiquido = totalReceitas - totalDespesas;

  const handleOpenCreateModal = (tipo) => {
    setTransacaoParaAcao(null);
    setModalTipo(tipo);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transacao) => {
    setTransacaoParaAcao(transacao);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (transacao) => {
    setTransacaoParaAcao(transacao);
    setDeleteMode('single');
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setTransacaoParaAcao(null);
  };

  const handleModalSuccess = (transacaoAtualizada, eraEdicao) => {
    if (eraEdicao) {
      if (transacaoAtualizada.group_id) {
        fetchTransacoes();
      } else {
        setTransacoes(transacoes.map(t =>
          t.id === transacaoAtualizada.id ? transacaoAtualizada : t
        ));
      }
    } else {
      const dataNovaTransacao = new Date(transacaoAtualizada.data_transacao);
      const mesNova = dataNovaTransacao.getUTCMonth() + 1;
      const anoNova = dataNovaTransacao.getUTCFullYear();

      if (mesNova === mesFiltro && anoNova === anoFiltro) {
        if (transacaoAtualizada.group_id) {
          fetchTransacoes();
        } else {
          const listaAtualizada = [...transacoes, transacaoAtualizada];
          listaAtualizada.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
          setTransacoes(listaAtualizada);
        }
      }
    }
    handleCloseModals();
  };

  const handleConfirmDelete = async () => {
    if (!transacaoParaAcao) return;
    try {
      await api.delete(`/transacoes/${transacaoParaAcao.id}`, {
        params: { delete_mode: deleteMode }
      });
      if (deleteMode === 'future') {
        fetchTransacoes();
      } else {
        setTransacoes(transacoes.filter(t => t.id !== transacaoParaAcao.id));
      }
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação.");
      handleCloseModals();
    }
  };

  const pagarTransacaoUnica = async (transacao) => {
    const novoStatus = transacao.status === 'pendente'
      ? (transacao.tipo === 'receita' ? 'recebido' : 'pago')
      : 'pendente';
    try {
      await api.patch(`/transacoes/${transacao.id}/status`, { status: novoStatus });
      setTransacoes(prev =>
        prev.map(t => t.id === transacao.id ? { ...t, status: novoStatus } : t)
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleTogglePago = (transacao) => {
    // Se está marcando como pago E é uma despesa vinculada a cartão → pergunta se paga tudo
    const contaVinculada = contas.find(c => c.id === transacao.conta_id);
    const ehCartao = contaVinculada?.tipo === 'cartao';

    if (transacao.status === 'pendente' && transacao.tipo === 'despesa' && ehCartao) {
      setTransacaoParaPagar(transacao);
      setIsPagarEmMassaModalOpen(true);
    } else {
      pagarTransacaoUnica(transacao);
    }
  };

  const handlePagarEmMassa = async () => {
    if (!transacaoParaPagar) return;
    try {
      await api.patch('/transacoes/pagar-em-massa', { conta_id: transacaoParaPagar.conta_id });
      // Atualiza localmente todas as despesas pendentes desse cartão
      setTransacoes(prev =>
        prev.map(t =>
          t.conta_id === transacaoParaPagar.conta_id && t.status === 'pendente' && t.tipo === 'despesa'
            ? { ...t, status: 'pago' }
            : t
        )
      );
    } catch (error) {
      console.error('Erro ao pagar em massa:', error);
    } finally {
      setIsPagarEmMassaModalOpen(false);
      setTransacaoParaPagar(null);
    }
  };

  const isRecorrente = transacaoParaAcao?.group_id;

  return (
    <>
      <div className="container mx-auto print:w-full print:max-w-none">

        <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 pt-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 transition-colors duration-200 shadow-sm print:static print:shadow-none print:bg-white print:pt-0">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
            {/* Botões de Ação */}
            <div className="flex gap-2 print:hidden">
              <button onClick={() => handleOpenCreateModal('receita')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg shadow hover:bg-green-700 transition-colors">
                <PlusIcon className="h-4 w-4" /> <span className="hidden sm:inline">Receita</span>
              </button>
              <button onClick={() => handleOpenCreateModal('despesa')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg shadow hover:bg-red-700 transition-colors">
                <PlusIcon className="h-4 w-4" /> <span className="hidden sm:inline">Despesa</span>
              </button>
            </div>

            {/* Botões de Ferramentas (Exportar e Imprimir) */}
            <div className="flex gap-2 print:hidden self-end sm:self-auto">
              <ExportButton mes={mesFiltro} ano={anoFiltro} />
              <PrintButton />
            </div>
          </div>

          <FiltroMesAno mes={mesFiltro} setMes={setMesFiltro} ano={anoFiltro} setAno={setAnoFiltro} />

          <div className="mt-2 print:hidden">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <FunnelIcon className="h-3.5 w-3.5" />
              {showFilters ? 'Ocultar Filtros' : 'Filtrar e Buscar'}
              {showFilters ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-1.5 animate-fade-in-down print:hidden">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-4 w-4 text-gray-400" /></div>
                  <input type="text" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 md:w-36">
                    <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="block w-full py-1.5 px-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs">
                      <option value="todos">Todos Tipos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                  </div>
                  <div className="flex-1 md:w-36">
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="block w-full py-1.5 px-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs">
                      <option value="todos">Todos Status</option>
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago/Recebido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filtro de Contas / Pagamentos (Multi-Select) */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Conta / Forma de Pagamento</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setIsContaDropdownOpen(!isContaDropdownOpen); setIsCatDropdownOpen(false); }}
                    className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-2.5 pr-8 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <CreditCardIcon className="h-4 w-4 text-gray-400" />
                      {filtroContas.length === 0
                        ? <span className="text-gray-500 dark:text-gray-400">Todas as contas</span>
                        : <span className="text-gray-900 dark:text-white">{filtroContas.length} selecionada(s)</span>
                      }
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </span>
                  </button>

                  {isContaDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-48 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                      <div
                        className="cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        onClick={() => setFiltroContas([])}
                      >
                        <span className={`block truncate ${filtroContas.length === 0 ? 'font-semibold' : 'font-normal'}`}>Todas</span>
                      </div>
                      {/* Opção especial: sem conta vinculada */}
                      <div
                        className="cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        onClick={() => setFiltroContas(prev =>
                          prev.includes(0) ? prev.filter(id => id !== 0) : [...prev, 0]
                        )}
                      >
                        <div className="flex items-center">
                          <input type="checkbox" checked={filtroContas.includes(0)} readOnly className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
                          <span className={`block truncate italic text-gray-400 dark:text-gray-500 ${filtroContas.includes(0) ? 'font-semibold' : 'font-normal'}`}>Sem conta vinculada</span>
                        </div>
                      </div>
                      {contas.map((conta) => (
                        <div
                          key={conta.id}
                          className="cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                          onClick={() => setFiltroContas(prev =>
                            prev.includes(conta.id) ? prev.filter(id => id !== conta.id) : [...prev, conta.id]
                          )}
                        >
                          <div className="flex items-center">
                            <input type="checkbox" checked={filtroContas.includes(conta.id)} readOnly className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
                            <span className={`block truncate ${filtroContas.includes(conta.id) ? 'font-semibold' : 'font-normal'}`}>
                              {conta.nome}
                            </span>
                            <span className="ml-1.5 text-gray-400 dark:text-gray-500">
                              ({conta.tipo === 'cartao' ? 'Cartão' : conta.tipo === 'dinheiro' ? 'Dinheiro' : conta.tipo_conta === 'poupanca' ? 'Poupança' : 'Corrente'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {filtroContas.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {filtroContas.map(id => {
                      if (id === 0) return (
                        <span key={0} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          Sem conta
                          <button type="button" onClick={() => setFiltroContas(prev => prev.filter(x => x !== 0))} className="ml-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none">
                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                        </span>
                      );
                      const conta = contas.find(c => c.id === id);
                      if (!conta) return null;
                      return (
                        <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {conta.nome}
                          <button type="button" onClick={() => setFiltroContas(prev => prev.filter(x => x !== id))} className="ml-1 inline-flex items-center justify-center text-blue-400 hover:text-blue-600 focus:outline-none">
                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                        </span>
                      );
                    })}
                    <button onClick={() => setFiltroContas([])} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>

              {/* Filtro de Categorias (Multi-Select Customizado) */}
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Categorias</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setIsCatDropdownOpen(!isCatDropdownOpen); setIsContaDropdownOpen(false); }}
                    className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-2.5 pr-8 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      {filtroCategorias.length === 0
                        ? <span className="text-gray-500 dark:text-gray-400">Todas as categorias</span>
                        : <span className="text-gray-900 dark:text-white">{filtroCategorias.length} selecionada(s)</span>
                      }
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </span>
                  </button>

                  {isCatDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-48 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                      <div
                        className="cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        onClick={() => setFiltroCategorias([])}
                      >
                        <span className={`block truncate ${filtroCategorias.length === 0 ? 'font-semibold' : 'font-normal'}`}>
                          Todas
                        </span>
                      </div>
                      {categorias.map((cat) => (
                        <div
                          key={cat.id}
                          className="cursor-pointer select-none relative py-1.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
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
                              className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                            />
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: cat.cor_hex }}></div>
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
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {categorias.filter(c => filtroCategorias.includes(c.id)).map(cat => (
                      <span key={cat.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {cat.nome}
                        <button
                          type="button"
                          onClick={() => setFiltroCategorias(prev => prev.filter(id => id !== cat.id))}
                          className="ml-1 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-500 focus:outline-none"
                        >
                          <span className="sr-only">Remover {cat.nome}</span>
                          <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setFiltroCategorias([])}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-2 flex justify-between items-center border-b dark:border-gray-700 pb-1.5 print:text-black print:border-gray-300">
            <span>Relatório de Transações</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full print:bg-gray-100 print:text-black">
              {transacoesFiltradas.length} ite{transacoesFiltradas.length !== 1 ? 'ns' : 'm'}
            </span>
          </h2>

          {!loading && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 mt-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs print:hidden">
              <span className="font-medium text-indigo-800 dark:text-indigo-200">
                {temFiltroAtivo ? 'Totais do filtro:' : 'Totais do mês:'}
              </span>
              <span className="text-green-700 dark:text-green-400 font-semibold">
                Receitas: +{formatCurrency(totalReceitas)}
              </span>
              <span className="text-red-700 dark:text-red-400 font-semibold">
                Despesas: -{formatCurrency(totalDespesas)}
              </span>
              <span className={`font-bold ${totalLiquido >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                Saldo: {totalLiquido >= 0 ? '+' : ''}{formatCurrency(totalLiquido)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-20 print:shadow-none print:border print:border-gray-300">
          <div className="flex flex-col">
            {loading ? (
              <p className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Carregando transações...</p>
            ) : (
              transacoesFiltradas.length > 0 ? (
                transacoesFiltradas.map((trans, index) => (
                  <TransacaoItem
                    key={trans.id}
                    transacao={trans}
                    isLast={index === transacoesFiltradas.length - 1}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                    onTogglePago={handleTogglePago}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma transação encontrada.</p>
                </div>
              )
            )}
          </div>
        </div>


      </div>

      {isModalOpen && (
        <ModalTransacao
          transacaoParaEditar={transacaoParaAcao}
          tipo={modalTipo}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
          dataPadrao={dataPadraoModal}
        />
      )}

      {isPagarEmMassaModalOpen && transacaoParaPagar && (() => {
        const contaVinculada = contas.find(c => c.id === transacaoParaPagar.conta_id);
        const pendentesDoCartao = transacoes.filter(
          t => t.conta_id === transacaoParaPagar.conta_id && t.status === 'pendente' && t.tipo === 'despesa'
        );
        const totalPendente = pendentesDoCartao.reduce((sum, t) => sum + t.valor, 0);
        return (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold dark:text-gray-200">Confirmar Pagamento</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Esta transação está vinculada ao cartão <span className="font-semibold">{contaVinculada?.nome}</span>.
                </p>
                {pendentesDoCartao.length > 1 && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Há <span className="font-semibold">{pendentesDoCartao.length} transações pendentes</span> neste cartão,
                    totalizando <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalPendente)}</span>.
                  </p>
                )}
                <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Como deseja pagar?</p>
              </div>
              <div className="flex flex-col gap-2 px-6 pb-6">
                <button
                  onClick={() => {
                    setIsPagarEmMassaModalOpen(false);
                    pagarTransacaoUnica(transacaoParaPagar);
                    setTransacaoParaPagar(null);
                  }}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Pagar apenas esta transação
                </button>
                {pendentesDoCartao.length > 1 && (
                  <button
                    onClick={handlePagarEmMassa}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Pagar todas as {pendentesDoCartao.length} pendentes do cartão ({formatCurrency(totalPendente)})
                  </button>
                )}
                <button
                  onClick={() => { setIsPagarEmMassaModalOpen(false); setTransacaoParaPagar(null); }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold dark:text-gray-200">Confirmar Exclusão</h3>
              {isRecorrente ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Esta é uma transação parcelada (recorrente). Como deseja excluir?</p>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input type="radio" name="deleteMode" value="single" checked={deleteMode === 'single'} onChange={(e) => setDeleteMode(e.target.value)} className="text-red-600 focus:ring-red-500" />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">Excluir apenas esta</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input type="radio" name="deleteMode" value="future" checked={deleteMode === 'future'} onChange={(e) => setDeleteMode(e.target.value)} className="text-red-600 focus:ring-red-500" />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-200">Excluir esta e futuras</span>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Tem certeza que deseja excluir a transação "<span className="font-bold">{transacaoParaAcao?.nome}</span>"?</p>
              )}
            </div>
            <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg">
              <button onClick={handleCloseModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Transacoes;
