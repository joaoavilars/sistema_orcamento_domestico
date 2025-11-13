import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helpers
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString) => {
  // Converte a string 'YYYY-MM-DD' para um objeto Date
  const date = new Date(dateString);
  // Adiciona o fuso horário local para evitar problemas de "um dia a menos"
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return format(utcDate, "dd/MM/yyyy", { locale: ptBR });
};


const TransacaoItem = ({ transacao, isLast }) => {
  const isDespesa = transacao.tipo === 'despesa';
  const valorFormatado = `${isDespesa ? '-' : '+'} ${formatCurrency(transacao.valor)}`;
  const corValor = isDespesa ? 'text-red-600' : 'text-green-600';
  const corStatus = transacao.status === 'pago' || transacao.status === 'recebido' 
    ? 'text-green-600' 
    : 'text-yellow-600';
  
  // Cor da barra lateral baseada na categoria (mock)
  const corCategoria = transacao.categoria?.cor_hex || '#808080'; // Default gray

  return (
    <div className={`flex items-center p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      {/* Barra de Cor */}
      <div 
        className="w-1.5 h-10 rounded-full mr-4" 
        style={{ backgroundColor: corCategoria }}
      ></div>

      {/* Infos */}
      <div className="flex-1">
        <p className="text-base font-medium text-gray-800">{transacao.nome}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${corCategoria}30`, // Cor com 30% de opacidade
              color: corCategoria 
            }}
          >
            {transacao.categoria?.nome || 'Sem Categoria'}
          </span>
          <span>•</span>
          <span>{formatDate(transacao.data_transacao)}</span>
        </div>
      </div>

      {/* Valor e Status */}
      <div className="text-right">
        <p className={`text-lg font-bold ${corValor}`}>{valorFormatado}</p>
        <p className={`text-sm font-medium capitalize ${corStatus}`}>
          {transacao.status}
        </p>
      </div>
      
      {/* TODO: Botões de Editar/Excluir (ícones) */}
    </div>
  );
};

export default TransacaoItem;