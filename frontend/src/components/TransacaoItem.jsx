import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PencilIcon, TrashIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  const isPendente = transacao.status === 'pendente';

  // 1. Formatação de Valores
  const valorFormatado = `${isDespesa ? '-' : '+'} ${formatCurrency(transacao.valor)}`;
  
  // Cores do Valor (Vermelho/Verde)
  const corValor = isDespesa 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-green-600 dark:text-green-400';
  
  const corCategoria = transacao.categoria?.cor_hex || '#808080';

  // 2. Definição do Ícone e Badge de Status
  const StatusIcon = isPendente ? ClockIcon : CheckCircleIcon;
  
  const statusBadgeClass = isPendente
    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
    : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800';

  // 3. Lógica de Cor de Fundo da Linha
  /* --- CONFIGURAÇÃO DE COR: DESTAQUE DE PENDENTE ---
     Para alterar a intensidade do destaque, mude as classes abaixo:
     
     Modo Claro (bg-yellow-100):
       - Mais fraco: bg-yellow-50
       - Mais forte: bg-yellow-200 ou bg-orange-100
     
     Modo Escuro (dark:bg-yellow-900/30):
       - O número final (/30) é a opacidade (30%).
       - Mais fraco: /10 ou /20
       - Mais forte: /40 ou /50
  */
  const rowBgClass = isPendente
    //? 'bg-orange-200 dark:bg-orange-800/60' // <-- LINHA PENDENTE (Destaque aumentado)
    ? 'bg-orange-200 dark:bg-orange-500/10'
    : 'bg-transparent';                       // <-- LINHA PAGA (Sem destaque)

  // Cor do texto secundário (Data/Categoria)
  const textSecondaryClass = 'text-gray-600 dark:text-gray-400';

  return (
    <div 
      className={`
        flex items-center p-4 transition-colors 
        ${rowBgClass} 
        ${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-700/50
      `}
    >
      {/* Barra de Cor da Categoria */}
      <div 
        className="w-1.5 h-12 rounded-full mr-3 sm:mr-4 shadow-sm flex-shrink-0" 
        style={{ backgroundColor: corCategoria }}
      ></div>

      {/* Informações Principais (Esquerda) */}
      <div className="flex-1 min-w-0 mr-2">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
          {transacao.nome}
        </p>
        
        {/* Mobile Wrapper */}
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm ${textSecondaryClass}`}>
          <span className="whitespace-nowrap">
            {formatDate(transacao.data_transacao)}
          </span>
          
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
          
          <span 
            className="px-2 py-0.5 rounded font-medium truncate max-w-full"
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

      {/* Valor e Status (Direita) */}
      <div className="flex flex-col items-end">
        <p className={`text-base sm:text-lg font-bold ${corValor} whitespace-nowrap`}>
          {valorFormatado}
        </p>
        
        {/* Badge de Status */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 border ${statusBadgeClass}`}>
          <StatusIcon className="h-3 w-3" />
          {transacao.status === 'recebido' ? 'Recebido' : transacao.status}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => onEdit(transacao)}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
          title="Editar"
        >
          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button 
          onClick={() => onDelete(transacao)}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
          title="Excluir"
        >
          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
};

export default TransacaoItem;