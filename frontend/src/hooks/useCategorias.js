import { useState, useEffect, useCallback } from 'react';
import { categoriaService } from '../services/categoriaService';

/**
 * Hook para gerenciar o estado e operações de Categorias
 * @param {boolean} [autoLoad=true] - Se deve carregar as categorias ao inicializar
 */
export const useCategorias = (autoLoad = true) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar categorias');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      fetchCategorias();
    }
  }, [autoLoad, fetchCategorias]);

  const addCategoria = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const novaCategoria = await categoriaService.create(payload);
      setCategorias((prev) => [...prev, novaCategoria]);
      return novaCategoria;
    } catch (err) {
      setError(err.message || 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategoria = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const categoriaAtualizada = await categoriaService.update(id, payload);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? categoriaAtualizada : c))
      );
      return categoriaAtualizada;
    } catch (err) {
      setError(err.message || 'Erro ao atualizar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoria = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoriaService.delete(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message || 'Erro ao excluir categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    addCategoria,
    updateCategoria,
    deleteCategoria
  };
};
