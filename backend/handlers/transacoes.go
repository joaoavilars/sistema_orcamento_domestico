package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// GetTransacoes - GET /transacoes
func GetTransacoes(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return // A função helper já enviou a resposta de erro
	}
	// --- FIM DA MUDANÇA ---

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
		// --- MUDANÇA: Usar familia_id ---
		Where("familia_id = ?", familiaID).
		// --- FIM DA MUDANÇA ---
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
	var input models.Transacao
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	input.FamiliaID = familiaID // Define a dona da transação (usa FamiliaID)
	// --- FIM DA MUDANÇA ---

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	database.DB.Preload("Categoria").First(&input, input.ID)
	c.JSON(http.StatusCreated, input)
}

// UpdateTransacao - PUT /transacoes/:id
func UpdateTransacao(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

	id := c.Param("id")
	var transacao models.Transacao
	// Verifica se a transação existe E pertence à família
	// --- MUDANÇA: Usar familia_id ---
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacao).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada ou não pertence à família"})
		return
	}
	// --- FIM DA MUDANÇA ---

	var input models.Transacao
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Atualiza campos (garante que o ID da família não mude)
	transacao.Nome = input.Nome
	transacao.Valor = input.Valor
	transacao.CategoriaID = input.CategoriaID
	transacao.DataTransacao = input.DataTransacao
	transacao.Status = input.Status
	transacao.Tipo = input.Tipo

	if err := database.DB.Save(&transacao).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	database.DB.Preload("Categoria").First(&transacao, transacao.ID)
	c.JSON(http.StatusOK, transacao)
}

// UpdateTransacaoStatus - PATCH /transacoes/:id/status
func UpdateTransacaoStatus(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}

	// Atualiza o status apenas se a transação pertencer à família
	// --- MUDANÇA: Usar familia_id ---
	result := database.DB.Model(&models.Transacao{}).
		Where("id = ? AND familia_id = ?", id, familiaID).
		Update("status", input.Status)
	// --- FIM DA MUDANÇA ---

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada ou não pertence à família"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado"})
}

// DeleteTransacao - DELETE /transacoes/:id
func DeleteTransacao(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

	id := c.Param("id")
	// Usa GORM para deletar (soft delete) apenas se pertencer à família
	// --- MUDANÇA: Usar familia_id ---
	result := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).Delete(&models.Transacao{})
	// --- FIM DA MUDANÇA ---

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada ou não pertence à família"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transação excluída com sucesso"})
}
