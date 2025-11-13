package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// ListFamilias - GET /admin/familias
func ListFamilias(c *gin.Context) {
	var familias []models.Familia
	if err := database.DB.Find(&familias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, familias)
}

// CreateFamilia - POST /admin/familias
func CreateFamilia(c *gin.Context) {
	var input models.Familia
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Erro ao criar família, nome pode já estar em uso"})
		return
	}
	c.JSON(http.StatusCreated, input)
}
