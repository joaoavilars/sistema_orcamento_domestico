import React from 'react';

const meses = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' },
];

const anoAtual = new Date().getFullYear();
const anos = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1];

const FiltroMesAno = ({ mes, setMes, ano, setAno }) => {
  return (
    // --- MUDANÇA AQUI ---
    <div className="flex gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div>
        <label htmlFor="filtro-mes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mês
        </label>
        <select
          id="filtro-mes"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          // --- MUDANÇA AQUI ---
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          {meses.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filtro-ano" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ano
        </label>
        <select
          id="filtro-ano"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          // --- MUDANÇA AQUI ---
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltroMesAno;