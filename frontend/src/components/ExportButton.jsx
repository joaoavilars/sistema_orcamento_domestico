import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const ExportButton = ({ mes, ano }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/transacoes/export?mes=${mes}&ano=${ano}`, {
        responseType: 'blob', // Importante: diz ao Axios que é um arquivo
      });

      // Cria um link temporário para forçar o download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Nome do arquivo
      link.setAttribute('download', `transacoes_${mes}_${ano}.csv`);
      
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao baixar o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 print:hidden disabled:opacity-50"
      title="Exportar para Excel (CSV)"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      <span className="hidden sm:inline">{loading ? 'Baixando...' : 'Exportar CSV'}</span>
    </button>
  );
};

export default ExportButton;