import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ui/ModalWrapper';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

const TIPO_OPTIONS = [
  { value: 'cartao', label: 'Cartão de Crédito' },
  { value: 'conta', label: 'Conta Bancária' },
  { value: 'beneficio', label: 'Cartão Benefício (VA/VR/Alimentação)' },
];

const TIPO_CONTA_OPTIONS = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Conta Poupança' },
];

const DIAS_CORTE = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `Dia ${i + 1}`,
}));

const ModalConta = ({ contaParaEditar, onClose, onSuccess }) => {
  const isEdicao = !!contaParaEditar;
  const isDinheiro = isEdicao && contaParaEditar.tipo === 'dinheiro';

  const [tipo, setTipo] = useState(contaParaEditar?.tipo || 'cartao');
  const [nome, setNome] = useState(contaParaEditar?.nome || '');
  const [ativo, setAtivo] = useState(contaParaEditar?.ativo !== undefined ? contaParaEditar.ativo : true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Campos de Cartão
  const [numeroCartao, setNumeroCartao] = useState(contaParaEditar?.numero_cartao || '');
  const [dataVencimento, setDataVencimento] = useState(contaParaEditar?.data_vencimento || '');
  const [nomeNoCartao, setNomeNoCartao] = useState(contaParaEditar?.nome_no_cartao || '');
  const [limiteCartao, setLimiteCartao] = useState(contaParaEditar?.limite_cartao || '');
  const [dataCorte, setDataCorte] = useState(contaParaEditar?.data_corte || '');

  // Campos de Conta Bancária
  const [nomeBanco, setNomeBanco] = useState(contaParaEditar?.nome_banco || '');
  const [numeroBanco, setNumeroBanco] = useState(contaParaEditar?.numero_banco || '');
  const [numeroAgencia, setNumeroAgencia] = useState(contaParaEditar?.numero_agencia || '');
  const [numeroConta, setNumeroConta] = useState(contaParaEditar?.numero_conta || '');
  const [digitoConta, setDigitoConta] = useState(contaParaEditar?.digito_conta || '');
  const [tipoConta, setTipoConta] = useState(contaParaEditar?.tipo_conta || 'corrente');
  const [saldoInicial, setSaldoInicial] = useState(contaParaEditar?.saldo_inicial || '');

  const isCartao = tipo === 'cartao';
  const isConta = tipo === 'conta';
  const isBeneficio = tipo === 'beneficio';

  const TIPO_TITLE_MAP = {
    cartao: 'Cartão de Crédito',
    conta: 'Conta Bancária',
    beneficio: 'Cartão Benefício',
    dinheiro: 'Dinheiro',
  };

  // Quando é edição de tipo "dinheiro", tratar como conta sem banco
  const title = isEdicao
    ? `Editar ${TIPO_TITLE_MAP[tipo] || 'Conta'}`
    : `Novo(a) ${TIPO_TITLE_MAP[tipo] || 'Conta'}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('O nome é obrigatório.');
      return;
    }

    if (isCartao && !limiteCartao) {
      setError('O limite do cartão é obrigatório.');
      return;
    }

    const payload = {
      nome: nome.trim(),
      tipo: isDinheiro ? 'dinheiro' : tipo,
      ativo,
      // Cartão
      numero_cartao: numeroCartao,
      data_vencimento: dataVencimento,
      nome_no_cartao: nomeNoCartao,
      limite_cartao: isCartao ? parseFloat(limiteCartao) || 0 : 0,
      data_corte: isCartao ? parseInt(dataCorte) || 0 : 0,
      // Conta/Dinheiro
      nome_banco: nomeBanco,
      numero_banco: numeroBanco,
      numero_agencia: numeroAgencia,
      numero_conta: numeroConta,
      digito_conta: digitoConta,
      tipo_conta: isConta ? tipoConta : '',
      saldo_inicial: !isCartao ? parseFloat(saldoInicial) || 0 : 0,
    };

    setLoading(true);
    try {
      const { contaService } = await import('../services/contaService');
      let result;
      if (isEdicao) {
        result = await contaService.update(contaParaEditar.id, payload);
      } else {
        result = await contaService.create(payload);
      }
      onSuccess(result, isEdicao);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erro ao salvar conta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      title={title}
      isOpen={true}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>
        )}

        {/* Seletor de tipo — só aparece na criação (não pode mudar tipo após criação) */}
        {!isEdicao && (
          <Select
            label="Tipo de Conta"
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            options={TIPO_OPTIONS}
          />
        )}

        {/* Tipo exibido em edição */}
        {isEdicao && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
            Tipo: <span className="font-semibold text-gray-700 dark:text-gray-300">
              {TIPO_TITLE_MAP[tipo] || tipo}
            </span>
          </div>
        )}

        <Input
          label="Nome"
          id="nome"
          type="text"
          placeholder={isCartao ? 'Ex: Nubank Crédito' : isDinheiro ? 'Dinheiro' : isBeneficio ? 'Ex: VR Alimentação' : 'Ex: Bradesco Corrente'}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        {/* Info Cartão Benefício */}
        {isBeneficio && (
          <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Cartão de Benefício</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Funciona como saldo real: receitas adicionam saldo (ex: crédito do empregador) e despesas descontam.
              Não possui ciclo de fatura — o saldo acumula mês a mês.
            </p>
          </div>
        )}

        {/* Campos de Cartão */}
        {isCartao && (
          <div className="space-y-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Dados do Cartão</p>

            <div className="flex gap-3">
              <Input
                className="flex-1"
                label="Número do Cartão"
                id="numeroCartao"
                type="text"
                placeholder="**** **** **** 1234"
                maxLength={25}
                value={numeroCartao}
                onChange={(e) => setNumeroCartao(e.target.value)}
              />
              <Input
                className="flex-1"
                label="Vencimento"
                id="dataVencimento"
                type="text"
                placeholder="MM/AAAA"
                maxLength={7}
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>

            <Input
              label="Nome no Cartão"
              id="nomeNoCartao"
              type="text"
              placeholder="Como aparece no cartão"
              value={nomeNoCartao}
              onChange={(e) => setNomeNoCartao(e.target.value)}
            />

            <div className="flex gap-3">
              <Input
                className="flex-1"
                label="Limite Total (R$)"
                id="limiteCartao"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={limiteCartao}
                onChange={(e) => setLimiteCartao(e.target.value)}
                required
              />
              <div className="flex-1">
                <Select
                  label="Data de Corte"
                  id="dataCorte"
                  value={dataCorte}
                  onChange={(e) => setDataCorte(e.target.value)}
                  options={DIAS_CORTE}
                  placeholder="Selecione..."
                />
              </div>
            </div>

            {dataCorte > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                A fatura fecha todo dia <strong>{dataCorte}</strong> do mês. Compras após essa data entram na próxima fatura.
              </p>
            )}
          </div>
        )}

        {/* Campos de Conta Bancária */}
        {isConta && (
          <div className="space-y-3 bg-green-50 dark:bg-green-900/10 p-3 rounded-md border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">Dados Bancários</p>

            <Select
              label="Tipo de Conta"
              id="tipoConta"
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
              options={TIPO_CONTA_OPTIONS}
            />

            <div className="flex gap-3">
              <Input
                className="flex-1"
                label="Nome do Banco"
                id="nomeBanco"
                type="text"
                placeholder="Ex: Bradesco"
                value={nomeBanco}
                onChange={(e) => setNomeBanco(e.target.value)}
              />
              <Input
                className="w-28"
                label="Cód. Banco"
                id="numeroBanco"
                type="text"
                placeholder="237"
                maxLength={10}
                value={numeroBanco}
                onChange={(e) => setNumeroBanco(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Input
                className="flex-1"
                label="Agência"
                id="numeroAgencia"
                type="text"
                placeholder="0001"
                value={numeroAgencia}
                onChange={(e) => setNumeroAgencia(e.target.value)}
              />
              <Input
                className="flex-1"
                label="Número da Conta"
                id="numeroConta"
                type="text"
                placeholder="12345"
                value={numeroConta}
                onChange={(e) => setNumeroConta(e.target.value)}
              />
              <Input
                className="w-20"
                label="Dígito"
                id="digitoConta"
                type="text"
                placeholder="0"
                maxLength={2}
                value={digitoConta}
                onChange={(e) => setDigitoConta(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Saldo inicial — para conta, dinheiro e benefício */}
        {(isConta || isDinheiro || isBeneficio) && (
          <Input
            label={isDinheiro ? 'Saldo atual em espécie (R$)' : isBeneficio ? 'Saldo atual no cartão (R$)' : 'Saldo Inicial (R$)'}
            id="saldoInicial"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
          />
        )}

        {/* Status Ativo/Inativo — apenas na edição */}
        {isEdicao && (
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
              Conta ativa
            </label>
            {!ativo && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                (aparece acinzentada no grid e não disponível para novas transações)
              </span>
            )}
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default ModalConta;
