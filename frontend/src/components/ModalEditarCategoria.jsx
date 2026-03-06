import React, { useState } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { ModalWrapper } from './ui/ModalWrapper';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const ModalEditarCategoria = ({ categoria, onClose, onSuccess }) => {
  const [nome, setNome] = useState(categoria.nome);
  const [cor, setCor] = useState(categoria.cor_hex);

  // Usamos o hook apenas para a função de update (controller)
  const { updateCategoria, loading } = useCategorias(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { nome, cor_hex: cor };
      const atualizada = await updateCategoria(categoria.id, payload);
      onSuccess(atualizada);
    } catch (err) {
      setError('Erro ao salvar. Verifique os campos.');
    }
  };

  return (
    <ModalWrapper
      title="Editar Categoria"
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
          label="Nome"
          id="nome-edit"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <div>
          <label htmlFor="cor-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cor
          </label>
          <input
            type="color"
            id="cor-edit"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            required
            className="block w-full rounded-md h-10 cursor-pointer border-gray-300 dark:border-gray-600"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ModalEditarCategoria;