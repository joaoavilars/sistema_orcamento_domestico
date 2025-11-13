import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrashIcon } from '@heroicons/react/24/outline'; // <-- VERIFIQUE SE O ÍCONE FOI IMPORTADO

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#FF0000');

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !cor) return;

    try {
      const novaCategoria = { nome, cor_hex: cor };
      const response = await api.post('/categorias', novaCategoria);
      setCategorias([...categorias, response.data]);
      setNome(''); // Limpa o formulário
      setCor('#FF0000'); // Reseta a cor
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };
  
  // --- ADICIONE ESTA FUNÇÃO ---
  const handleExcluirClick = (categoria) => {
    setCategoriaParaExcluir(categoria);
    setModalAberto(true);
  };
  // --- FIM DA ADIÇÃO ---

  const cancelarExclusao = () => {
    setCategoriaParaExcluir(null);
    setModalAberto(false);
  };

  const confirmarExclusao = async () => {
    if (!categoriaParaExcluir) return;

    try {
      await api.delete(`/categorias/${categoriaParaExcluir.id}`);
      // Remove a categoria da lista no state (UI)
      setCategorias(
        categorias.filter((cat) => cat.id !== categoriaParaExcluir.id)
      );
      cancelarExclusao();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert(
        'Erro ao excluir. A categoria pode estar sendo usada em transações.'
      );
      cancelarExclusao();
    }
  };

  return (
    <> {/* <-- ADICIONE O FRAGMENT AQUI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna 1: Formulário de Nova Categoria */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Nova Categoria
          </h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
          >
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div>
              <label
                htmlFor="cor"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cor
              </label>
              <input
                type="color" // Input de cor nativo do HTML
                id="cor"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                required
                className="mt-1 block w-full rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Salvar
            </button>
          </form>
        </div>

        {/* Coluna 2: Lista de Categorias */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Categorias Existentes
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {loading ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                Carregando...
              </p>
            ) : (
              <ul className="divide-y dark:divide-gray-700">
                {categorias.map((cat) => (
                  <li
                    key={cat.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: cat.cor_hex }}
                      ></span>
                      <span className="dark:text-gray-200">{cat.nome}</span>
                    </div>
                    <button
                      onClick={() => handleExcluirClick(cat)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
                {categorias.length === 0 && (
                  <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma categoria cadastrada.
                  </p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold dark:text-gray-200">
                Confirmar Exclusão
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Tem certeza que deseja excluir a categoria "
                <span className="font-bold">
                  {categoriaParaExcluir?.nome}
                </span>
                "?
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Isso não pode ser desfeito.
              </p>
            </div>
            <div className="flex justify-end gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg">
              <button
                type="button"
                onClick={cancelarExclusao}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </> 
  );
};

export default Categorias;