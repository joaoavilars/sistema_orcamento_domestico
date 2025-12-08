import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import api from '../services/api'; // Importe sua instância do Axios

const FiltroMesAno = ({ mes, setMes, ano, setAno }) => {
  const [anosDisponiveis, setAnosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os anos disponíveis na API ao carregar o componente
  useEffect(() => {
    const fetchAnos = async () => {
      try {
        const response = await api.get('/transacoes/anos');
        // A API retorna um array de números [2024, 2025, 2026, 2027]
        let anos = response.data || [];
        
        // Garante que o ano atual selecionado esteja na lista (caso seja um ano novo sem transações ainda)
        if (!anos.includes(ano)) {
            anos.push(ano);
            anos.sort((a, b) => a - b);
        }
        
        setAnosDisponiveis(anos);
      } catch (error) {
        console.error("Erro ao buscar anos:", error);
        // Fallback: Ano atual e próximo
        const currentYear = new Date().getFullYear();
        setAnosDisponiveis([currentYear, currentYear + 1]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnos();
  }, []); // Executa apenas uma vez na montagem

  // Se o usuário navegar para um ano que não estava na lista (via setas), adiciona-o
  useEffect(() => {
      if (anosDisponiveis.length > 0 && !anosDisponiveis.includes(ano)) {
          setAnosDisponiveis(prev => [...prev, ano].sort((a,b) => a - b));
      }
  }, [ano]);


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

  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleMesProximo = () => {
    if (mes === 12) {
      setMes(1);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Navegação Rápida (Setas) */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button 
            onClick={handleMesAnterior}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
            {meses.find(m => m.valor === mes)?.nome} {ano}
          </span>

          <button 
            onClick={handleMesProximo}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            title="Próximo Mês"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Seletores Dropdown */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="w-1/2 sm:w-40">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {meses.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-1/2 sm:w-32">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              disabled={loading}
              className="block w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {anosDisponiveis.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FiltroMesAno;