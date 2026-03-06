import api from './api';

export const transacaoService = {
  /**
   * Busca todas as transações
   * @param {Object} [params] - Parâmetros de query opcionais (ex: mes, ano)
   * @returns {Promise<Array>}
   */
  getAll: async (params) => {
    const response = await api.get('/transacoes', { params });
    return response.data;
  },

  /**
   * Cria uma nova transação
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  create: async (payload) => {
    const response = await api.post('/transacoes', payload);
    return response.data;
  },

  /**
   * Atualiza uma transação existente
   * @param {number} id 
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  update: async (id, payload) => {
    const response = await api.put(`/transacoes/${id}`, payload);
    return response.data;
  },

  /**
   * Exclui uma transação
   * @param {number} id 
   * @param {string} mode - 'single' ou 'future' (excluir lote)
   * @returns {Promise<void>}
   */
  delete: async (id, mode = 'single') => {
    await api.delete(`/transacoes/${id}`, { data: { mode } });
  },

  /**
   * Transfere uma transação pendente para o próximo mês
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  transferirProximoMes: async (id) => {
    const response = await api.post(`/transacoes/${id}/transferir-proximo-mes`);
    return response.data;
  }
};
