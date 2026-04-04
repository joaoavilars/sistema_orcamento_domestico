import React, { useState, useEffect } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { useTransacaoForm } from '../hooks/useTransacoes';
import { contaService } from '../services/contaService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ModalWrapper } from './ui/ModalWrapper';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const FORMA_PAGAMENTO_OPTIONS = [
  { value: '', label: 'Padrão' },
  { value: 'debito', label: 'Débito' },
  { value: 'pix', label: 'PIX' },
];

const ModalTransacao = ({ tipo, onClose, onSuccess, transacaoParaEditar, dataPadrao }) => {
  const { categorias, loading: loadingCategorias } = useCategorias(true);
  const { salvarTransacao, transferirProximoMes, loading, error, setError } = useTransacaoForm();

  // Estados do Formulário
  const [nome, setNome] = useState(transacaoParaEditar?.nome || '');
  const [valor, setValor] = useState(transacaoParaEditar?.valor || '');

  const dataInicial = transacaoParaEditar?.data_transacao
    ? new Date(transacaoParaEditar.data_transacao).toISOString().split('T')[0]
    : (dataPadrao || new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(dataInicial);

  const [categoriaId, setCategoriaId] = useState(transacaoParaEditar?.categoria_id || '');
  const [status, setStatus] = useState(transacaoParaEditar?.status || 'pendente');

  // Conta/Forma de pagamento
  const [contas, setContas] = useState([]);
  const [contaId, setContaId] = useState(transacaoParaEditar?.conta_id ? String(transacaoParaEditar.conta_id) : '');
  const [formaPagamento, setFormaPagamento] = useState(transacaoParaEditar?.forma_pagamento || '');

  // Parcelamento
  const [isParcelado, setIsParcelado] = useState(false);
  const [qtdParcelas, setQtdParcelas] = useState(2);

  // Edição em Lote
  const [editMode, setEditMode] = useState('single');

  const isEdicao = !!transacaoParaEditar;
  const isRecorrente = isEdicao && !!transacaoParaEditar.group_id;
  const isPendente = isEdicao && transacaoParaEditar.status === 'pendente';
  const tipoFinal = isEdicao ? transacaoParaEditar.tipo : tipo;
  const isReceita = tipoFinal === 'receita';

  useEffect(() => {
    if (!isEdicao && categorias.length > 0 && !categoriaId) {
      setCategoriaId(categorias[0].id);
    } else if (isEdicao && transacaoParaEditar.categoria_id && categorias.length > 0) {
      setCategoriaId(String(transacaoParaEditar.categoria_id));
    }
  }, [categorias, isEdicao, transacaoParaEditar, categoriaId]);

  useEffect(() => {
    if (!isEdicao && dataPadrao) {
      setData(dataPadrao);
    }
  }, [isEdicao, dataPadrao]);

  useEffect(() => {
    contaService.getAll().then(data => {
      // Apenas contas ativas
      setContas(data.filter(c => c.ativo));
    }).catch(() => {});
  }, []);

  // Conta selecionada para saber se mostrar forma de pagamento
  const contaSelecionada = contas.find(c => String(c.id) === contaId);
  const isContaCorrente = contaSelecionada?.tipo === 'conta' && contaSelecionada?.tipo_conta === 'corrente';
  const isCartao = contaSelecionada?.tipo === 'cartao';
  const isBeneficio = contaSelecionada?.tipo === 'beneficio';

  // Débito e PIX são pagamentos imediatos — marcar como pago automaticamente
  const handleFormaPagamentoChange = (e) => {
    const forma = e.target.value;
    setFormaPagamento(forma);
    if (forma === 'debito' || forma === 'pix') {
      setStatus(isReceita ? 'recebido' : 'pago');
    }
  };

  // Ao selecionar conta benefício, o gasto é imediato (saldo descontado na hora)
  const handleContaChange = (e) => {
    const novaConta = contas.find(c => String(c.id) === e.target.value);
    setContaId(e.target.value);
    setFormaPagamento('');
    if (novaConta?.tipo === 'beneficio') {
      setStatus(isReceita ? 'recebido' : 'pago');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formaFinal = isCartao ? 'credito' : formaPagamento;

    const payload = {
      nome,
      valor: parseFloat(valor),
      data_transacao: new Date(data),
      categoria_id: parseInt(categoriaId),
      tipo: tipoFinal,
      status: status,
      conta_id: contaId ? parseInt(contaId) : null,
      forma_pagamento: formaFinal,
      is_parcelado: !isEdicao && isParcelado,
      qtd_parcelas: parseInt(qtdParcelas),
      edit_mode: editMode
    };

    if (!payload.nome || !payload.valor || !payload.categoria_id) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const result = await salvarTransacao(isEdicao, payload, transacaoParaEditar?.id);
      onSuccess(result, isEdicao);
    } catch (err) {
      // O erro já é tratado no hook (setError)
    }
  };

  const handleTransferirProximoMes = async () => {
    if (!transacaoParaEditar || !isPendente) return;
    try {
      const result = await transferirProximoMes(transacaoParaEditar.id);
      onSuccess(result, true);
    } catch (err) {
      // Erro tratado no hook
    }
  };

  const title = isEdicao ? 'Editar Transação' : (isReceita ? 'Nova Receita' : 'Nova Despesa');
  const statusConcluido = isReceita ? 'recebido' : 'pago';
  const labelCheckbox = isReceita ? 'Já foi recebido?' : 'Já foi pago?';
  const isChecked = status === 'pago' || status === 'recebido';

  const valorNum = parseFloat(valor) || 0;
  const totalParcelado = valorNum * qtdParcelas;

  const categoriaOptions = categorias.map(c => ({ value: c.id, label: c.nome }));

  return (
    <ModalWrapper
      title={title}
      isOpen={true}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || loadingCategorias}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

        {/* Opções de Edição em Lote */}
        {isRecorrente && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Edição em Lote</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="editMode" value="single" checked={editMode === 'single'} onChange={(e) => setEditMode(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Alterar apenas esta</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="editMode" value="future" checked={editMode === 'future'} onChange={(e) => setEditMode(e.target.value)} className="text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Alterar esta e as futuras</span>
              </label>
            </div>
          </div>
        )}

        {/* Opção de Parcelamento na Criação */}
        {!isEdicao && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label htmlFor="isParcelado" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                É parcelada?
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  id="isParcelado"
                  checked={isParcelado}
                  onChange={(e) => setIsParcelado(e.target.checked)}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5"
                  style={{ right: isParcelado ? '0' : 'auto', left: isParcelado ? 'auto' : '0' }}
                />
                <label
                  htmlFor="isParcelado"
                  className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${isParcelado ? 'bg-indigo-600' : 'bg-gray-300'}`}
                ></label>
              </div>
            </div>
            {isParcelado && (
              <div className="mt-3 animate-fade-in-down">
                <Input
                  label="Quantidade de Parcelas"
                  id="qtdParcelas"
                  type="number"
                  min="2"
                  max="120"
                  value={qtdParcelas}
                  onChange={(e) => setQtdParcelas(e.target.value)}
                />
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-semibold text-right">
                  Total Estimado: {formatCurrency(totalParcelado)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Transferir próximo mês */}
        {isEdicao && isPendente && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Transferir para o próximo mês</p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mb-3">Esta dívida será movida para o mesmo dia do mês seguinte.</p>
            <Button
              type="button"
              onClick={handleTransferirProximoMes}
              disabled={loading}
              fullWidth
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300"
            >
              Transferir para Próximo Mês
            </Button>
          </div>
        )}

        <Input
          label="Nome"
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <div className="flex gap-4">
          <Input
            className="flex-1"
            label={isParcelado ? 'Valor da Parcela' : 'Valor (R$)'}
            id="valor"
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
          <Input
            className="flex-1"
            label="Data"
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>

        <Select
          label="Categoria"
          id="categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
          options={categoriaOptions}
          placeholder={loadingCategorias ? 'Carregando...' : 'Selecione...'}
        />

        {/* Conta / Cartão */}
        <div className="space-y-2">
          <Select
            label="Conta / Cartão (opcional)"
            id="conta"
            value={contaId}
            onChange={handleContaChange}
            options={contas.map(c => ({ value: c.id, label: c.nome }))}
            placeholder="Sem vínculo de conta"
          />
          {isContaCorrente && (
            <Select
              label="Forma de Pagamento"
              id="formaPagamento"
              value={formaPagamento}
              onChange={handleFormaPagamentoChange}
              options={FORMA_PAGAMENTO_OPTIONS}
            />
          )}
          {isCartao && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-2">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Compra no crédito
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                A transação será registrada automaticamente no <strong>mês seguinte</strong> como pendente — quando a fatura vence. O limite do cartão já é descontado imediatamente.
              </p>
            </div>
          )}
          {isBeneficio && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md px-3 py-2">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Cartão Benefício
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                O saldo é descontado imediatamente. A transação será marcada como <strong>paga</strong> automaticamente.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="status"
            checked={isChecked}
            onChange={(e) => setStatus(e.target.checked ? statusConcluido : 'pendente')}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="status" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
            {labelCheckbox}
          </label>
        </div>
      </form>
    </ModalWrapper>
  );
}

export default ModalTransacao;