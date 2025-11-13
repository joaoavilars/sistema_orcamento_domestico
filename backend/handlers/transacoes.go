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
// Filtra por ?mes=10&ano=2025
func GetTransacoes(c *gin.Context) {
	// TODO: Pegar usuario_id do token JWT
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return // A função helper já enviou a resposta de erro
	}

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")

	if mesStr == "" || anoStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'mes' e 'ano' são obrigatórios"})
		return
	}

	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)

	// Calcula o primeiro e último dia do mês
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var transacoes []models.Transacao

	// Usamos Preload("Categoria") para carregar os dados da categoria junto (Eager Loading)
	result := database.DB.
		Preload("Categoria").
		Where("usuario_id = ?", usuarioID).
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

	// TODO: Pegar usuario_id do token JWT
	input.UsuarioID = 1 // Placeholder

	// Salva no banco
	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Recarrega para incluir a Categoria
	database.DB.Preload("Categoria").First(&input, input.ID)

	c.JSON(http.StatusCreated, input)
}

// UpdateTransacao - PUT /transacoes/:id
func UpdateTransacao(c *gin.Context) {
	id := c.Param("id")
	// TODO: Verificar se a transação pertence ao usuário logado

	var transacao models.Transacao
	if err := database.DB.First(&transacao, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	var input models.Transacao
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Atualiza os campos
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
	id := c.Param("id")
	// TODO: Verificar se a transação pertence ao usuário logado

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}

	var transacao models.Transacao
	if err := database.DB.First(&transacao, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	if err := database.DB.Model(&transacao).Update("status", input.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transacao)
}

// DeleteTransacao - DELETE /transacoes/:id
func DeleteTransacao(c *gin.Context) {
	id := c.Param("id")
	// TODO: Verificar se a transação pertence ao usuário logado

	// Usamos soft delete (GORM já faz isso se o model tiver gorm.DeletedAt)
	if err := database.DB.Delete(&models.Transacao{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transação excluída com sucesso"})
}
