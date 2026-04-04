import api from './api';

export const contaService = {
  getAll: async () => {
    const response = await api.get('/contas');
    return response.data || [];
  },

  create: async (payload) => {
    const response = await api.post('/contas', payload);
    return response.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/contas/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/contas/${id}`);
  }
};
