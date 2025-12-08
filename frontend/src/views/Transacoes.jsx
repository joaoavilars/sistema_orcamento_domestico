import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ModalTransacao from '../components/ModalTransacao';
import TransacaoItem from '../components/TransacaoItem';
import FiltroMesAno from '../components/FiltroMesAno';
// --- MUDANÇA: Importar ícones de seta (Chevron) e Funil ---
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  // --- MUDANÇA: Estado para controlar a visibilidade dos filtros ---
  const [showFilters, setShowFilters] = useState(false); 

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('despesa');
  const [transacaoParaAcao, setTransacaoParaAcao] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);

  // Lógica de Filtragem
  const transacoesFiltradas = transacoes.filter((t) => {
    const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    let matchStatus = true;
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'pendente') {
        matchStatus = t.status === 'pendente';
      } else if (filtroStatus === 'pago') {
        matchStatus = t.status === 'pago' || t.status === 'recebido';
      }
    }
    return matchBusca && matchTipo && matchStatus;
  });

  // Handlers
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
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setTransacaoParaAcao(null);
  };

  const handleModalSuccess = (transacaoAtualizada, eraEdicao) => {
    if (eraEdicao) {
      setTransacoes(transacoes.map(t => 
        t.id === transacaoAtualizada.id ? transacaoAtualizada : t
      ));
    } else {
      const dataNovaTransacao = new Date(transacaoAtualizada.data_transacao);
      const mesNova = dataNovaTransacao.getUTCMonth() + 1;
      const anoNova = dataNovaTransacao.getUTCFullYear();

      if (mesNova === mesFiltro && anoNova === anoFiltro) {
        const listaAtualizada = [...transacoes, transacaoAtualizada];
        listaAtualizada.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
        setTransacoes(listaAtualizada);
      }
    }
    handleCloseModals();
  };
  
  const handleConfirmDelete = async () => {
    if (!transacaoParaAcao) return;
    try {
      await api.delete(`/transacoes/${transacaoParaAcao.id}`);
      setTransacoes(transacoes.filter(t => t.id !== transacaoParaAcao.id));
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação.");
      handleCloseModals();
    }
  };

  return (
    <>
      <div className="container mx-auto">
        
        {/* Cabeçalho Fixo */}
        <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 pt-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 transition-colors duration-200 shadow-sm">
          
          {/* Linha 1: Botões de Ação */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleOpenCreateModal('receita')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors text-sm font-medium flex-1 sm:flex-none"
            >
              <PlusIcon className="h-5 w-5" />
              Receita
            </button>
            <button
              onClick={() => handleOpenCreateModal('despesa')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm font-medium flex-1 sm:flex-none"
            >
              <PlusIcon className="h-5 w-5" />
              Despesa
            </button>
          </div>

          <FiltroMesAno 
            mes={mesFiltro}
            setMes={setMesFiltro}
            ano={anoFiltro}
            setAno={setAnoFiltro}
          />

          {/* --- LINHA 3: BOTÃO TOGGLE DE FILTROS --- */}
          <div className="mt-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Filtrar e Buscar'}
              {showFilters ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* --- BARRA DE FILTROS (CONDICIONAL) --- */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-2 animate-fade-in-down">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 md:w-40">
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="todos">Todos Tipos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                  </div>
                  <div className="flex-1 md:w-40">
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="todos">Todos Status</option>
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago/Recebido</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ------------------------------------- */}
          
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 flex justify-between items-center border-b dark:border-gray-700 pb-2">
            <span>Transações</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
              {transacoesFiltradas.length}
            </span>
          </h2>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-20">
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
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhuma transação encontrada.</p>
                  {transacoes.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros.</p>
                  )}
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
        />
      )}
      
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold dark:text-gray-200">
                Confirmar Exclusão
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir a transação "
                <span className="font-bold">
                  {transacaoParaAcao?.nome}
                </span>
                "?
              </p>
            </div>
            <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg">
              <button
                type="button"
                onClick={handleCloseModals}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Transacoes;