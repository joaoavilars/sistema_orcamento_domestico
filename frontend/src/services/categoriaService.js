import api from './api';

export const categoriaService = {
  /**
   * Busca todas as categorias
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    const response = await api.get('/categorias');
    return response.data || [];
  },

  /**
   * Cria uma nova categoria
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  create: async (payload) => {
    const response = await api.post('/categorias', payload);
    return response.data;
  },

  /**
   * Atualiza uma categoria existente
   * @param {number} id 
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  update: async (id, payload) => {
    const response = await api.put(`/categorias/${id}`, payload);
    return response.data;
  },

  /**
   * Exclui uma categoria
   * @param {number} id 
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await api.delete(`/categorias/${id}`);
  }
};
