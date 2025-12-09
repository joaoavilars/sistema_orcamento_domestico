import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';

const PrintButton = () => {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 print:hidden"
      title="Imprimir ou Salvar em PDF"
    >
      <PrinterIcon className="h-5 w-5" />
      <span className="hidden sm:inline">Imprimir</span>
    </button>
  );
};

export default PrintButton;