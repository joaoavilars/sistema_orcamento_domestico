import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PencilIcon, TrashIcon, CheckCircleIcon, ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

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

const TransacaoItem = ({ transacao, isLast, onEdit, onDelete, onTogglePago }) => {
  const isDespesa = transacao.tipo === 'despesa';
  const isPendente = transacao.status === 'pendente';

  const valorFormatado = `${isDespesa ? '-' : '+'} ${formatCurrency(transacao.valor)}`;
  
  // Ajuste de cores para impressão: sempre preto/cinza escuro se possível ou mantendo a cor mas sem fundo escuro
  const corValor = isDespesa 
    ? 'text-red-600 dark:text-red-400 print:text-red-700' 
    : 'text-green-600 dark:text-green-400 print:text-green-700';
  
  const corCategoria = transacao.categoria?.cor_hex || '#808080';

  const StatusIcon = isPendente ? ClockIcon : CheckCircleIcon;
  
  // Badge de Status: Forçar borda fina e fundo claro na impressão
  const statusBadgeClass = isPendente
    ? 'bg-amber-100 dark:bg-amber-500/10 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800 print:bg-transparent print:border-gray-300 print:text-black'
    : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 print:bg-transparent print:border-gray-300 print:text-black';

  const rowBgClass = isPendente
    ? 'bg-amber-100 dark:bg-amber-500/10 print:bg-transparent' // Remove fundo colorido na impressão
    : 'bg-transparent';

  const textSecondaryClass = 'text-gray-600 dark:text-gray-400 print:text-gray-600';

  return (
    <div 
      className={`
        flex items-center p-4 transition-colors 
        ${rowBgClass} 
        ${!isLast ? 'border-b border-gray-200 dark:border-gray-700 print:border-gray-300' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-700/50 print:hover:bg-transparent
        print:break-inside-avoid /* Evita quebrar a linha no meio de uma página */
      `}
    >
      <div 
        className="w-1.5 h-12 rounded-full mr-3 sm:mr-4 shadow-sm flex-shrink-0 print:border print:border-gray-300" 
        style={{ backgroundColor: corCategoria }}
      ></div>

      <div className="flex-1 min-w-0 mr-2">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate print:text-black print:whitespace-normal">
          {transacao.nome}
        </p>
        
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm ${textSecondaryClass}`}>
          <span className="whitespace-nowrap">
            {formatDate(transacao.data_transacao)}
          </span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600 print:text-gray-400">•</span>
          <span 
            className="px-2 py-0.5 rounded font-medium truncate max-w-full print:border print:border-gray-200 print:bg-transparent print:text-black"
            style={{ 
              backgroundColor: `${corCategoria}20`, 
              color: corCategoria,
              filter: 'brightness(0.9)' 
            }}
          >
            {transacao.categoria?.nome || 'Geral'}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <p className={`text-base sm:text-lg font-bold ${corValor} whitespace-nowrap`}>
          {valorFormatado}
        </p>
        
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 border ${statusBadgeClass}`}>
          <StatusIcon className="h-3 w-3" />
          {transacao.status === 'recebido' ? 'Recebido' : transacao.status}
        </div>
      </div>

      {/* --- MUDANÇA: Esconder Botões na Impressão (print:hidden) --- */}
      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700 print:hidden">
        <button
          onClick={() => onTogglePago(transacao)}
          className={`p-1.5 sm:p-2 rounded-full transition-colors ${
            isPendente
              ? 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
              : 'text-green-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
          }`}
          title={isPendente ? 'Marcar como Pago' : 'Marcar como Pendente'}
        >
          {isPendente
            ? <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            : <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          }
        </button>
        <button onClick={() => onEdit(transacao)} className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors" title="Editar">
          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button onClick={() => onDelete(transacao)} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors" title="Excluir">
          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

export default TransacaoItem;