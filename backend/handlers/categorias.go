package handlers

import (
	"net/http"
	"strconv" // Certifique-se que este import está presente

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// GetCategorias - GET /categorias
func GetCategorias(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return // A função helper já enviou a resposta de erro
	}
	// --- FIM DA MUDANÇA ---

	var categorias []models.Categoria
	// --- MUDANÇA: Usar familia_id ---
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

	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	input.FamiliaID = familiaID // Define a dona da categoria (usa FamiliaID)
	// --- FIM DA MUDANÇA ---

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// DeleteCategoria - DELETE /categorias/:id
func DeleteCategoria(c *gin.Context) {
	// --- MUDANÇA: Usar FamiliaID ---
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de categoria inválido"})
		return
	}

	// --- MUDANÇA: Usar familia_id ---
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
