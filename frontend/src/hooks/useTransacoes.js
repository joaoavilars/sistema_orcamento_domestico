import { useState, useCallback } from 'react';
import { transacaoService } from '../services/transacaoService';

/**
 * Hook para gerenciar operações de uma Única Transação ou Fluxos de Modais
 */
export const useTransacaoForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const salvarTransacao = useCallback(async (isEdicao, payload, id = null) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isEdicao && id) {
        data = await transacaoService.update(id, payload);
      } else {
        data = await transacaoService.create(payload);
      }
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Erro ao salvar transação. Tente novamente.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transferirProximoMes = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transacaoService.transferirProximoMes(id);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Erro ao transferir para o próximo mês. Tente novamente.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const excluirTransacao = useCallback(async (id, mode = 'single') => {
    setLoading(true);
    setError(null);
    try {
      await transacaoService.delete(id, mode);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Erro ao excluir transação. Tente novamente.';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    salvarTransacao,
    transferirProximoMes,
    excluirTransacao
  };
};
