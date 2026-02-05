import React, { useState, useEffect } from 'react';
import api from '../services/api';
import FiltroMesAno from '../components/FiltroMesAno';
import PrintButton from '../components/PrintButton'; // <-- Importado corretamente
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area, ComposedChart
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
  const [categorias, setCategorias] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [tipoGrafico, setTipoGrafico] = useState('line'); // 'line', 'area', 'composed'
  const [categoriasAnualData, setCategoriasAnualData] = useState(null);
  const [loadingCategoriasAnual, setLoadingCategoriasAnual] = useState(false);
  const [mostrarSeletorCategorias, setMostrarSeletorCategorias] = useState(false);

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());

  // Buscar categorias disponíveis
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias');
        setCategorias(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error.message);
      }
    };
    fetchCategorias();
  }, []);

  // Buscar dados principais do dashboard
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

  // Buscar dados de categorias anuais quando categorias selecionadas ou ano mudarem
  useEffect(() => {
    const fetchCategoriasAnual = async () => {
      if (categoriasSelecionadas.length === 0) {
        setCategoriasAnualData(null);
        return;
      }

      setLoadingCategoriasAnual(true);
      try {
        const categoriasParams = categoriasSelecionadas.map(id => `categorias=${id}`).join('&');
        const response = await api.get(`/dashboard/categorias-anual?ano=${anoFiltro}&${categoriasParams}`);
        setCategoriasAnualData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados de categorias anuais:", error.message);
        setCategoriasAnualData(null);
      } finally {
        setLoadingCategoriasAnual(false);
      }
    };
    fetchCategoriasAnual();
  }, [categoriasSelecionadas, anoFiltro]);

  // Fechar seletor de categorias ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarSeletorCategorias && !event.target.closest('.categoria-selector')) {
        setMostrarSeletorCategorias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarSeletorCategorias]);

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

        {/* 3. Gráfico de Categorias Anual */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md print:shadow-none print:border print:border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h3 className="text-xl font-semibold dark:text-gray-200">Análise de Categorias (Ano)</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Seletor de Tipo de Gráfico */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</label>
                <select
                  value={tipoGrafico}
                  onChange={(e) => setTipoGrafico(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="line">Linha</option>
                  <option value="area">Área</option>
                  <option value="composed">Combinado</option>
                </select>
              </div>

              {/* Seletor de Categorias */}
              <div className="relative categoria-selector">
                <button
                  type="button"
                  onClick={() => setMostrarSeletorCategorias(!mostrarSeletorCategorias)}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-left flex items-center justify-between"
                >
                  <span>
                    {categoriasSelecionadas.length === 0
                      ? 'Selecione categorias'
                      : `${categoriasSelecionadas.length} categoria(s) selecionada(s)`}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mostrarSeletorCategorias && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <button
                        onClick={() => setCategoriasSelecionadas([])}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        <span className={categoriasSelecionadas.length === 0 ? 'font-semibold' : 'font-normal'}>
                          Limpar seleção
                        </span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                      {categorias.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={categoriasSelecionadas.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCategoriasSelecionadas([...categoriasSelecionadas, cat.id]);
                              } else {
                                setCategoriasSelecionadas(categoriasSelecionadas.filter(id => id !== cat.id));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: cat.cor_hex || '#8884d8' }}
                            ></span>
                            <span className={categoriasSelecionadas.includes(cat.id) ? 'font-semibold' : 'font-normal'}>
                              {cat.nome}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags das categorias selecionadas */}
          {categoriasSelecionadas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categorias
                .filter(c => categoriasSelecionadas.includes(c.id))
                .map(cat => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.cor_hex || '#8884d8' }}
                    ></span>
                    {cat.nome}
                    <button
                      onClick={() => setCategoriasSelecionadas(categoriasSelecionadas.filter(id => id !== cat.id))}
                      className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
          )}

          {/* Gráfico */}
          {loadingCategoriasAnual ? (
            <div className="text-center text-gray-500 dark:text-gray-400 h-[400px] flex items-center justify-center">
              Carregando dados...
            </div>
          ) : categoriasSelecionadas.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 h-[400px] flex items-center justify-center">
              Selecione uma ou mais categorias para visualizar o gráfico.
            </div>
          ) : categoriasAnualData && categoriasAnualData.meses ? (
            <ResponsiveContainer width="100%" height={400}>
              {tipoGrafico === 'line' && (
                <LineChart data={categoriasAnualData.meses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)} />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                  {categoriasAnualData.categorias.map((cat, index) => (
                    <Line
                      key={cat.id}
                      type="monotone"
                      dataKey={cat.nome}
                      stroke={cat.cor || '#8884d8'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              )}
              {tipoGrafico === 'area' && (
                <AreaChart data={categoriasAnualData.meses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)} />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                  {categoriasAnualData.categorias.map((cat, index) => (
                    <Area
                      key={cat.id}
                      type="monotone"
                      dataKey={cat.nome}
                      stackId="1"
                      stroke={cat.cor || '#8884d8'}
                      fill={cat.cor || '#8884d8'}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              )}
              {tipoGrafico === 'composed' && (
                <ComposedChart data={categoriasAnualData.meses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)} />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                  <Legend />
                  {categoriasAnualData.categorias.map((cat, index) => (
                    <Line
                      key={cat.id}
                      type="monotone"
                      dataKey={cat.nome}
                      stroke={cat.cor || '#8884d8'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                  {categoriasAnualData.categorias.map((cat, index) => (
                    <Area
                      key={`area-${cat.id}`}
                      type="monotone"
                      dataKey={cat.nome}
                      fill={cat.cor || '#8884d8'}
                      fillOpacity={0.2}
                    />
                  ))}
                </ComposedChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 h-[400px] flex items-center justify-center">
              Sem dados para as categorias selecionadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;