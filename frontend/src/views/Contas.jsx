import React, { useState, useEffect, useCallback } from 'react';
import { contaService } from '../services/contaService';
import ModalConta from '../components/ModalConta';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const TIPO_LABEL = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão de Crédito',
  conta: 'Conta Bancária',
  beneficio: 'Cartão Benefício',
};

const TipoIcon = ({ tipo, className = 'h-5 w-5' }) => {
  if (tipo === 'cartao') return <CreditCardIcon className={className} />;
  if (tipo === 'conta') return <BuildingLibraryIcon className={className} />;
  if (tipo === 'beneficio') return <ShoppingBagIcon className={className} />;
  return <BanknotesIcon className={className} />;
};

const TIPO_COLOR = {
  dinheiro: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  cartao: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  conta: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  beneficio: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
};

const ContaCard = ({ conta, isSelected, onClick }) => {
  const isCartao = conta.tipo === 'cartao';
  const inactive = !conta.ativo;

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg border p-4 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}
        ${inactive
          ? 'bg-gray-50 dark:bg-gray-800/40 opacity-60'
          : 'bg-white dark:bg-gray-800'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Ícone + tipo */}
        <div className={`p-2 rounded-md ${TIPO_COLOR[conta.tipo] || TIPO_COLOR.dinheiro}`}>
          <TipoIcon tipo={conta.tipo} className="h-5 w-5" />
        </div>

        {/* Status badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold truncate ${inactive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
              {conta.nome}
            </span>
            {inactive && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Inativa
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{TIPO_LABEL[conta.tipo]}</span>
          {conta.tipo === 'conta' && conta.tipo_conta && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              — {conta.tipo_conta === 'corrente' ? 'Corrente' : 'Poupança'}
            </span>
          )}
          {conta.tipo === 'conta' && conta.tipo_conta === 'corrente' && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Aceita: Débito · PIX
            </p>
          )}
        </div>
      </div>

      {/* Dados de saldo / limite */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {isCartao ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Limite total</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(conta.limite_cartao)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Usado (ciclo atual)</span>
              <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(conta.limite_usado)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Disponível</span>
              <span className={`font-semibold ${conta.limite_disponivel >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(conta.limite_disponivel)}
              </span>
            </div>
            {/* Barra de uso */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all"
                style={{ width: `${Math.min(100, conta.limite_cartao > 0 ? (conta.limite_usado / conta.limite_cartao) * 100 : 0)}%` }}
              />
            </div>
            {conta.data_corte > 0 && (
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                Corte da fatura: dia {conta.data_corte}
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Saldo atual</span>
            <span className={`text-sm font-bold ${conta.saldo_atual >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(conta.saldo_atual)}
            </span>
          </div>
        )}
      </div>

      {/* Detalhes bancários resumidos */}
      {conta.tipo === 'conta' && conta.nome_banco && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 truncate">
          {conta.nome_banco}
          {conta.numero_agencia ? ` · Ag: ${conta.numero_agencia}` : ''}
          {conta.numero_conta ? ` · Cc: ${conta.numero_conta}${conta.digito_conta ? `-${conta.digito_conta}` : ''}` : ''}
        </p>
      )}
    </div>
  );
};

const Contas = () => {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchContas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contaService.getAll();
      setContas(data);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContas();
  }, [fetchContas]);

  const handleOpenCreate = () => {
    setContaSelecionada(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!contaSelecionada) return;
    setIsModalOpen(true);
  };

  const handleOpenDelete = () => {
    if (!contaSelecionada) return;
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = (contaSalva, eraEdicao) => {
    if (eraEdicao) {
      setContas(prev => prev.map(c => c.id === contaSalva.id ? contaSalva : c));
      setContaSelecionada(contaSalva);
    } else {
      setContas(prev => [...prev, contaSalva]);
      setContaSelecionada(contaSalva);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!contaSelecionada) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await contaService.delete(contaSelecionada.id);
      setContas(prev => prev.filter(c => c.id !== contaSelecionada.id));
      setContaSelecionada(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao excluir conta.';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const temSelecao = !!contaSelecionada;

  return (
    <>
      <div className="container mx-auto">

        {/* Barra de botões */}
        <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 pt-2 pb-3 -mx-4 px-4 md:mx-0 md:px-0 transition-colors duration-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Contas e Cartões</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Nova
            </button>
            <button
              onClick={handleOpenEdit}
              disabled={!temSelecao}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg shadow hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PencilIcon className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleOpenDelete}
              disabled={!temSelecao}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg shadow hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TrashIcon className="h-4 w-4" />
              Excluir
            </button>
          </div>
          {temSelecao && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Selecionado: <span className="font-medium text-gray-700 dark:text-gray-300">{contaSelecionada.nome}</span>
              <button
                onClick={() => setContaSelecionada(null)}
                className="ml-2 text-indigo-500 hover:underline"
              >
                Limpar seleção
              </button>
            </p>
          )}
        </div>

        {/* Grid de Contas */}
        {loading ? (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Carregando contas...</p>
        ) : contas.length === 0 ? (
          <div className="p-10 text-center">
            <BanknotesIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma conta cadastrada.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Clique em <strong>Nova</strong> para adicionar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-20">
            {contas.map((conta) => (
              <ContaCard
                key={conta.id}
                conta={conta}
                isSelected={contaSelecionada?.id === conta.id}
                onClick={() => setContaSelecionada(
                  contaSelecionada?.id === conta.id ? null : conta
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <ModalConta
          contaParaEditar={contaSelecionada}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal Excluir */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold dark:text-gray-200">Confirmar Exclusão</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir a conta <span className="font-bold">"{contaSelecionada?.nome}"</span>?
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Se houver transações vinculadas, inative a conta em vez de excluir.
              </p>
              {deleteError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {deleteError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contas;
