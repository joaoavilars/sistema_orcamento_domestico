import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FiltroMesAno from '../components/FiltroMesAno';
import PrintButton from '../components/PrintButton'; // <-- Importado corretamente
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const CardSumario = ({ title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md print:border print:border-gray-200 print:shadow-none">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <p className={`text-3xl font-bold ${color}`}>
      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
    </p>
  </div>
);

const Dashboard = () => {
  const [sumario, setSumario] = useState(null);
  const [pizzaData, setPizzaData] = useState([]);
  const [colunasData, setColunasData] = useState([]);
  const [loading, setLoading] = useState(true);

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumarioRes, pizzaRes, colunasRes] = await Promise.all([
          api.get(`/dashboard/sumario?mes=${mesFiltro}&ano=${anoFiltro}`),
          api.get(`/dashboard/pizza-categorias?mes=${mesFiltro}&ano=${anoFiltro}`),
          api.get(`/dashboard/colunas-balanco?ano=${anoFiltro}`)
        ]);
        
        setSumario(sumarioRes.data);
        
        const formattedPizzaData = (pizzaRes.data || []).map(item => ({
          name: item.nome,
          value: item.total,
          fill: item.cor || '#8884d8'
        }));
        setPizzaData(formattedPizzaData);
        
        setColunasData(colunasRes.data || []); 

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mesFiltro, anoFiltro]);

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Carregando dashboard...</p>;
  }

  return (
    <div className="container mx-auto print:w-full print:max-w-none">
      
      {/* --- CABEÇALHO DO DASHBOARD (COM BOTÃO IMPRIMIR) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Financeiro
        </h2>
        <div className="mt-4 sm:mt-0">
          <PrintButton />
        </div>
      </div>
      {/* --------------------------------------------------- */}

      <div className="space-y-8">
        <FiltroMesAno 
          mes={mesFiltro}
          setMes={setMesFiltro}
          ano={anoFiltro}
          setAno={setAnoFiltro}
        />

        {/* 1. Sumário */}
        {sumario && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSumario title="Total Receitas" value={sumario.total_receitas} color="text-green-600 print:text-green-800" />
            <CardSumario title="Total Despesas" value={sumario.total_despesas} color="text-red-600 print:text-red-800" />
            <CardSumario title="Saldo" value={sumario.saldo} color={sumario.saldo >= 0 ? 'text-blue-600 print:text-blue-800' : 'text-red-600 print:text-red-800'} />
          </div>
        )}

        {/* 2. Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:break-inside-avoid">
          {/* Gráfico Pizza */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md print:shadow-none print:border print:border-gray-200">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Despesas por Categoria (Mês)</h3>
            {pizzaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pizzaData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pizzaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 h-[300px] flex items-center justify-center">Sem dados de despesa para este período.</p>
            )}
          </div>
          
          {/* Gráfico Barras */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md print:shadow-none print:border print:border-gray-200">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Balanço (Ano)</h3>
            {colunasData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={colunasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$${value}`} />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="#82ca9d" />
                  <Bar dataKey="despesa" name="Despesa" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 h-[300px] flex items-center justify-center">
                Sem dados para o gráfico de balanço.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;