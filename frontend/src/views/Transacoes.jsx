import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ModalTransacao from '../components/ModalTransacao';
import TransacaoItem from '../components/TransacaoItem';
import FiltroMesAno from '../components/FiltroMesAno'; // <-- Importa o filtro
import { PlusIcon } from '@heroicons/react/24/solid';

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('despesa');

  // --- MUDANÇA: ESTADO DO FILTRO DINÂMICO ---
  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth() + 1); // JS Mês é 0-indexado
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());
  // --- FIM DA MUDANÇA ---

  const fetchTransacoes = async () => {
    setLoading(true);
    try {
      // Usa o estado dinâmico
      const response = await api.get(
        `/transacoes?mes=${mesFiltro}&ano=${anoFiltro}`
      );
      setTransacoes(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega quando os filtros mudam
  useEffect(() => {
    fetchTransacoes();
  }, [mesFiltro, anoFiltro]);

  const openModal = (tipo) => {
    setModalTipo(tipo);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Lógica para adicionar a transação ao estado local
  const handleModalSuccess = (novaTransacao) => {
    const dataNovaTransacao = new Date(novaTransacao.data_transacao);
    const mesNova = dataNovaTransacao.getUTCMonth() + 1;
    const anoNova = dataNovaTransacao.getUTCFullYear();

    // Só adiciona na tela se pertencer ao filtro atual
    if (mesNova === mesFiltro && anoNova === anoFiltro) {
      // Adiciona e re-ordena pela data mais recente
      const listaAtualizada = [...transacoes, novaTransacao];
      listaAtualizada.sort((a, b) => new Date(b.data_transacao) - new Date(a.data_transacao));
      setTransacoes(listaAtualizada);
    }
    
    handleModalClose();
  };

  return (
    <div className="container mx-auto">
      {/* Botões de Ação */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => openModal('receita')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Receita
        </button>
        <button
          onClick={() => openModal('despesa')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nova Despesa
        </button>
      </div>

      {/* --- ADICIONA O FILTRO --- */}
      <FiltroMesAno 
        mes={mesFiltro}
        setMes={setMesFiltro}
        ano={anoFiltro}
        setAno={setAnoFiltro}
      />

      {/* Lista de Transações */}
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
              />
            ))
          )}
          {!loading && transacoes.length === 0 && (
             <p className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhuma transação encontrada para este período.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ModalTransacao
          tipo={modalTipo}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Transacoes;