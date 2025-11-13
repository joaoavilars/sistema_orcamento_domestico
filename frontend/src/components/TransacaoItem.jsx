import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return format(utcDate, "dd/MM/yyyy", { locale: ptBR });
};


const TransacaoItem = ({ transacao, isLast, onEdit, onDelete }) => {
  const isDespesa = transacao.tipo === 'despesa';
  const valorFormatado = `${isDespesa ? '-' : '+'} ${formatCurrency(transacao.valor)}`;
  const corValor = isDespesa ? 'text-red-600' : 'text-green-600';
  const corStatus = transacao.status === 'pago' || transacao.status === 'recebido' 
    ? 'text-green-600' 
    : 'text-yellow-600';
  
  const corCategoria = transacao.categoria?.cor_hex || '#808080';

  return (
    <div className={`flex items-center p-4 ${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
      {/* Barra de Cor */}
      <div 
        className="w-1.5 h-10 rounded-full mr-4" 
        style={{ backgroundColor: corCategoria }}
      ></div>

      {/* Infos */}
      <div className="flex-1">
        <p className="text-base font-medium text-gray-800 dark:text-gray-200">
          {transacao.nome}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${corCategoria}30`,
              color: corCategoria 
            }}
          >
            {transacao.categoria?.nome || 'Sem Categoria'}
          </span>
          <span>•</span>
          <span>{formatDate(transacao.data_transacao)}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-3 mx-4">
        <button 
          onClick={() => onEdit(transacao)}
          className="text-gray-400 hover:text-indigo-500"
          title="Editar"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button 
          onClick={() => onDelete(transacao)}
          className="text-gray-400 hover:text-red-500"
          title="Excluir"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Valor e Status */}
      <div className="text-right w-32">
        <p className={`text-lg font-bold ${corValor}`}>{valorFormatado}</p>
        <p className={`text-sm font-medium capitalize ${corStatus}`}>
          {transacao.status}
        </p>
      </div>
    </div>
  );
};

export default TransacaoItem;