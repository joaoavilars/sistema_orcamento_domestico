package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// ContaComSaldo representa uma Conta com os valores calculados de saldo/limite
type ContaComSaldo struct {
	models.Conta
	SaldoAtual       float64 `json:"saldo_atual"`
	LimiteUsado      float64 `json:"limite_usado"`
	LimiteDisponivel float64 `json:"limite_disponivel"`
}

func calcularSaldoConta(conta models.Conta) ContaComSaldo {
	cs := ContaComSaldo{Conta: conta}

	if conta.Tipo == "cartao" {
		// Para cartão: calcular gastos do ciclo atual (pendentes + pagos)
		// pois despesas pendentes já comprometem o limite disponível
		var limiteUsado float64

		now := time.Now()
		var inicioCiclo time.Time

		if conta.DataCorte > 0 {
			// Se o dia de hoje é antes do corte, o ciclo começou no corte do mês anterior
			if now.Day() < conta.DataCorte {
				inicioCiclo = time.Date(now.Year(), now.Month()-1, conta.DataCorte, 0, 0, 0, 0, now.Location())
			} else {
				inicioCiclo = time.Date(now.Year(), now.Month(), conta.DataCorte, 0, 0, 0, 0, now.Location())
			}
		} else {
			// Sem data de corte: usar início do mês atual
			inicioCiclo = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		}

		// Inclui pendentes E pagos — despesa pendente já reduz o limite disponível
		database.DB.Model(&models.Transacao{}).
			Where("conta_id = ? AND tipo = 'despesa' AND status IN ('pago','pendente') AND data_transacao >= ? AND deleted_at IS NULL",
				conta.ID, inicioCiclo).
			Select("COALESCE(SUM(valor), 0)").
			Scan(&limiteUsado)

		cs.LimiteUsado = limiteUsado
		cs.LimiteDisponivel = conta.LimiteCartao - limiteUsado
		cs.SaldoAtual = cs.LimiteDisponivel
	} else {
		// Para conta bancária e dinheiro: saldo_inicial + receitas recebidas - despesas pagas
		var totalReceitas, totalDespesas float64

		database.DB.Model(&models.Transacao{}).
			Where("conta_id = ? AND tipo = 'receita' AND status = 'recebido' AND deleted_at IS NULL", conta.ID).
			Select("COALESCE(SUM(valor), 0)").
			Scan(&totalReceitas)

		database.DB.Model(&models.Transacao{}).
			Where("conta_id = ? AND tipo = 'despesa' AND status = 'pago' AND deleted_at IS NULL", conta.ID).
			Select("COALESCE(SUM(valor), 0)").
			Scan(&totalDespesas)

		cs.SaldoAtual = conta.SaldoInicial + totalReceitas - totalDespesas
	}

	return cs
}

func GetContas(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var contas []models.Conta
	database.DB.Where("familia_id = ?", familiaID).Order("tipo ASC, nome ASC").Find(&contas)

	result := make([]ContaComSaldo, len(contas))
	for i, conta := range contas {
		result[i] = calcularSaldoConta(conta)
	}

	c.JSON(http.StatusOK, result)
}

func CreateConta(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var conta models.Conta
	if err := c.ShouldBindJSON(&conta); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	conta.FamiliaID = familiaID
	conta.Ativo = true

	if err := database.DB.Create(&conta).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar conta"})
		return
	}

	cs := calcularSaldoConta(conta)
	c.JSON(http.StatusCreated, cs)
}

func UpdateConta(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	id := c.Param("id")

	var conta models.Conta
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&conta).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	var input models.Conta
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Preservar campos imutáveis
	input.ID = conta.ID
	input.FamiliaID = conta.FamiliaID
	input.CreatedAt = conta.CreatedAt

	if err := database.DB.Save(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar conta"})
		return
	}

	cs := calcularSaldoConta(input)
	c.JSON(http.StatusOK, cs)
}

func DeleteConta(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	id := c.Param("id")

	var conta models.Conta
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&conta).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	// Bloquear exclusão se houver transações vinculadas
	var count int64
	database.DB.Model(&models.Transacao{}).
		Where("conta_id = ? AND deleted_at IS NULL", conta.ID).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Não é possível excluir uma conta com transações vinculadas. Use a opção 'Editar' para inativá-la.",
		})
		return
	}

	if err := database.DB.Delete(&conta).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir conta"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conta excluída com sucesso"})
}
