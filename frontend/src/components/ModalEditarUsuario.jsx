import React, { useState } from 'react';
import api from '../services/api';
import { ModalWrapper } from './ui/ModalWrapper';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const ModalEditarUsuario = ({ usuario, familias, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [familiaId, setFamiliaId] = useState(usuario.familia_id || 'sem-familia');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {};
    if (password) {
      if (password.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres.');
        setLoading(false);
        return;
      }
      payload.password = password;
    }

    payload.familia_id = familiaId === 'sem-familia' ? null : parseInt(familiaId);

    if (usuario.role === 'admin' && payload.familia_id !== null) {
      setError('Administradores não podem pertencer a famílias.');
      setLoading(false);
      return;
    }

    try {
      await api.put(`/admin/users/${usuario.id}`, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const familiaOptions = familias.map(f => ({ value: f.id, label: f.nome }));

  return (
    <ModalWrapper
      title={`Editar Usuário: ${usuario.email}`}
      isOpen={true}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

        <Input
          label="Nova Senha (Deixe em branco para não alterar)"
          id="edit-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div>
          <Select
            label="Família"
            id="edit-familia"
            value={familiaId}
            onChange={(e) => setFamiliaId(e.target.value)}
            disabled={usuario.role === 'admin'}
            options={familiaOptions}
            placeholder="-- Nenhuma --"
          />
          {usuario.role === 'admin' && (
            <p className="text-xs text-gray-500 mt-1">Admins não podem ter famílias.</p>
          )}
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ModalEditarUsuario;