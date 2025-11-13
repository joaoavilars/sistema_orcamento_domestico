import React, { useState, useEffect, useCallback } from 'react'; // <-- Importa o 'useCallback'
import api from '../services/api';
import ModalTransacao from '../components/ModalTransacao';
import TransacaoItem from '../components/TransacaoItem';
import FiltroMesAno from '../components/FiltroMesAno';
import { PlusIcon } from '@heroicons/react/24/solid';

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('despesa');
  const [transacaoParaAcao, setTransacaoParaAcao] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());

  // --- FUNÇÃO "MEMORIZADA" COM useCallback ---
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
  }, [mesFiltro, anoFiltro]); // <-- Dependências do useCallback
  // --- FIM DA CORREÇÃO ---

  // --- useEffect AGORA DEPENDE DA FUNÇÃO MEMORIZADA ---
  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);
  // --- FIM DA CORREÇÃO ---

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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleOpenCreateModal('receita')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nova Receita
          </button>
          <button
            onClick={() => handleOpenCreateModal('despesa')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nova Despesa
          </button>
        </div>

        <FiltroMesAno 
          mes={mesFiltro}
          setMes={setMesFiltro}
          ano={anoFiltro}
          setAno={setAnoFiltro}
        />

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Transações</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="flex flex-col">
            {loading ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">Carregando...</p>
            ) : (
              transacoes.map((trans, index) => (
                <TransacaoItem 
                  key={trans.id} 
                  transacao={trans} 
                  isLast={index === transacoes.length - 1}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))
            )}
            {!loading && transacoes.length === 0 && (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhuma transação encontrada para este período.</p>
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