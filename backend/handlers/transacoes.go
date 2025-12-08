package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// Helper para gerar um ID aleatório curto para o grupo
func generateGroupID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 16) // Fallback
	}
	return hex.EncodeToString(bytes)
}

// GetTransacoes - GET /transacoes
func GetTransacoes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	if mesStr == "" || anoStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'mes' e 'ano' são obrigatórios"})
		return
	}
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var transacoes []models.Transacao

	result := database.DB.
		Preload("Categoria").
		Where("familia_id = ?", familiaID).
		Where("data_transacao BETWEEN ? AND ?", primeiroDia, ultimoDia).
		Order("data_transacao DESC").
		Find(&transacoes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, transacoes)
}

// CreateTransacao - POST /transacoes
func CreateTransacao(c *gin.Context) {
	type CreateInput struct {
		models.Transacao
		IsParcelado bool `json:"is_parcelado"`
		QtdParcelas int  `json:"qtd_parcelas"`
	}

	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	// Se for parcelado, gera um ID de grupo único
	var groupID string
	if input.IsParcelado && input.QtdParcelas > 1 {
		groupID = generateGroupID()
	}

	// Caso simples: Não parcelado
	if !input.IsParcelado || input.QtdParcelas < 2 {
		transacao := input.Transacao
		transacao.FamiliaID = familiaID
		// Garante que group_id seja vazio se não for parcelado
		transacao.GroupID = ""

		if err := database.DB.Create(&transacao).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		database.DB.Preload("Categoria").First(&transacao, transacao.ID)
		c.JSON(http.StatusCreated, transacao)
		return
	}

	// Caso Parcelado: Loop
	var transacoesCriadas []models.Transacao
	nomeOriginal := input.Nome
	dataOriginal := input.DataTransacao
	statusOriginal := input.Status

	for i := 0; i < input.QtdParcelas; i++ {
		t := input.Transacao
		t.FamiliaID = familiaID
		t.GroupID = groupID // Todas compartilham o mesmo ID de grupo

		t.Nome = fmt.Sprintf("%s (%d/%d)", nomeOriginal, i+1, input.QtdParcelas)
		t.DataTransacao = dataOriginal.AddDate(0, i, 0)

		if i > 0 {
			t.Status = "pendente"
		} else {
			t.Status = statusOriginal
		}

		if err := database.DB.Create(&t).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar parcelas: " + err.Error()})
			return
		}
		transacoesCriadas = append(transacoesCriadas, t)
	}

	c.JSON(http.StatusCreated, transacoesCriadas[0])
}

// UpdateTransacao - PUT /transacoes/:id
func UpdateTransacao(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	id := c.Param("id")
	var transacaoOriginal models.Transacao

	// Busca a transação original para pegar o GroupID e Data
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacaoOriginal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	// Struct de entrada com campo extra 'edit_mode'
	type UpdateInput struct {
		models.Transacao
		EditMode string `json:"edit_mode"` // "single" ou "future"
	}

	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lógica de Atualização
	// 1. Se for edição simples OU não tiver grupo, edita só ela
	if input.EditMode != "future" || transacaoOriginal.GroupID == "" {
		transacaoOriginal.Nome = input.Nome
		transacaoOriginal.Valor = input.Valor
		transacaoOriginal.CategoriaID = input.CategoriaID
		transacaoOriginal.DataTransacao = input.DataTransacao
		transacaoOriginal.Status = input.Status
		transacaoOriginal.Tipo = input.Tipo

		if err := database.DB.Save(&transacaoOriginal).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// 2. Edição em Lote ("Esta e futuras")
		// Atualiza todas do mesmo grupo que tenham data >= data da original
		// Nota: Não atualizamos o NOME e a DATA para não quebrar a sequência (x/y) e os meses.
		// Atualizamos Valor, Categoria e Tipo.

		result := database.DB.Model(&models.Transacao{}).
			Where("group_id = ? AND familia_id = ? AND data_transacao >= ?", transacaoOriginal.GroupID, familiaID, transacaoOriginal.DataTransacao).
			Updates(map[string]interface{}{
				"valor":        input.Valor,
				"categoria_id": input.CategoriaID,
				"tipo":         input.Tipo,
				// "status": input.Status, // Geralmente não queremos marcar todas as futuras como pagas ao editar uma
			})

		// A transação atual específica (a que foi clicada) DEVE receber todas as atualizações (incluindo status e data se mudou)
		// O Updates acima já cuidou do valor/categoria. Vamos garantir a atual.
		transacaoOriginal.Nome = input.Nome
		transacaoOriginal.Valor = input.Valor
		transacaoOriginal.CategoriaID = input.CategoriaID
		transacaoOriginal.DataTransacao = input.DataTransacao
		transacaoOriginal.Status = input.Status
		database.DB.Save(&transacaoOriginal)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
	}

	database.DB.Preload("Categoria").First(&transacaoOriginal, transacaoOriginal.ID)
	c.JSON(http.StatusOK, transacaoOriginal)
}

// ... (UpdateTransacaoStatus e DeleteTransacao continuam iguais, pois delete em lote é mais perigoso e não foi pedido) ...
// Copie as funções UpdateTransacaoStatus e DeleteTransacao do arquivo anterior ou deixe como estão se já estiverem usando familiaID.

// UpdateTransacaoStatus - PATCH /transacoes/:id/status
func UpdateTransacaoStatus(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}
	result := database.DB.Model(&models.Transacao{}).
		Where("id = ? AND familia_id = ?", id, familiaID).
		Update("status", input.Status)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado"})
}

// DeleteTransacao - DELETE /transacoes/:id
func DeleteTransacao(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	result := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).Delete(&models.Transacao{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Transação excluída com sucesso"})
}
