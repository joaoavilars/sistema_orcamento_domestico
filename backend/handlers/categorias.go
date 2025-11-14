package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// GetCategorias - GET /categorias
func GetCategorias(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var categorias []models.Categoria
	if err := database.DB.Where("familia_id = ?", familiaID).Find(&categorias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, categorias)
}

// CreateCategoria - POST /categorias
func CreateCategoria(c *gin.Context) {
	var input models.Categoria
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	input.FamiliaID = familiaID

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// DeleteCategoria - DELETE /categorias/:id
func DeleteCategoria(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de categoria inválido"})
		return
	}

	result := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).Delete(&models.Categoria{})

	if result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Não foi possível excluir. A categoria pode estar em uso por transações."})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada ou não pertence à família"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Categoria excluída com sucesso"})
}

// --- NOVA FUNÇÃO ADICIONADA ---

// UpdateCategoria - PUT /categorias/:id
func UpdateCategoria(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de categoria inválido"})
		return
	}

	// Pega os novos dados (nome e cor) do corpo do JSON
	var input struct {
		Nome   string `json:"nome" binding:"required"`
		CorHex string `json:"cor_hex" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome e cor são obrigatórios"})
		return
	}

	// Busca a categoria no banco
	var categoria models.Categoria
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&categoria).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada ou não pertence à família"})
		return
	}

	// Atualiza os campos
	categoria.Nome = input.Nome
	categoria.CorHex = input.CorHex

	// Salva no banco
	if err := database.DB.Save(&categoria).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar atualização da categoria"})
		return
	}

	// Retorna a categoria atualizada
	c.JSON(http.StatusOK, categoria)
}
