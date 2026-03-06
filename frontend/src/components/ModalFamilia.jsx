import React, { useState } from 'react';
import api from '../services/api';
import { ModalWrapper } from './ui/ModalWrapper';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const ModalFamilia = ({ onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/admin/familias', { nome });
      onSuccess(response.data);
    } catch (err) {
      setError('Erro ao salvar. Nome da família já pode existir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      title="Cadastrar Nova Família"
      isOpen={true}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

        <Input
          label="Nome da Família (Ex: Casa Ávila)"
          id="nome-familia"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </form>
    </ModalWrapper>
  );
};

export default ModalFamilia;