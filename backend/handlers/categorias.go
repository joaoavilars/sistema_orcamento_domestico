package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

func GetCategorias(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	var categorias []models.Categoria
	if err := database.DB.Where("familia_id = ?", familiaID).Order("nome ASC").Find(&categorias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, categorias)
}

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

func DeleteCategoria(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	result := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).Delete(&models.Categoria{})
	if result.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Categoria em uso."})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Não encontrada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Excluída"})
}

func UpdateCategoria(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	var input struct {
		Nome   string `json:"nome"`
		CorHex string `json:"cor_hex"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	var categoria models.Categoria
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&categoria).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Não encontrada"})
		return
	}
	categoria.Nome = input.Nome
	categoria.CorHex = input.CorHex
	database.DB.Save(&categoria)
	c.JSON(http.StatusOK, categoria)
}
