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
	// Pega o ID do usuário do contexto do middleware
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return // A função helper já enviou a resposta de erro
	}

	var categorias []models.Categoria
	if err := database.DB.Where("usuario_id = ?", usuarioID).Find(&categorias).Error; err != nil {
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

	// Pega o ID do usuário do contexto do middleware
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return
	}
	input.UsuarioID = usuarioID // Define o dono da categoria

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// DeleteCategoria - DELETE /categorias/:id
func DeleteCategoria(c *gin.Context) {
	// Pega o ID do usuário do contexto do middleware
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de categoria inválido"})
		return
	}

	result := database.DB.Where("id = ? AND usuario_id = ?", id, usuarioID).Delete(&models.Categoria{})

	if result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Não foi possível excluir. A categoria pode estar em uso por transações."})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada ou não pertence ao usuário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Categoria excluída com sucesso"})
}
