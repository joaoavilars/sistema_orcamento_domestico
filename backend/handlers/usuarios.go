package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
	"golang.org/x/crypto/bcrypt"
)

func ListUsers(c *gin.Context) {
	var users []models.User
	// Preload Familias para mostrar no frontend
	if err := database.DB.Preload("Familias").Select("id", "nome", "email", "role", "created_at").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var input struct {
		Nome      string `json:"nome" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=8"`
		Role      string `json:"role" binding:"required"`
		FamiliaID *uint  `json:"familia_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	// Regra de Negócio: Admin sem família, User com família
	if input.Role == "user" && input.FamiliaID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuários padrão devem pertencer a uma família."})
		return
	}

	// Se houver um usuário soft-deleted com o mesmo email, remove permanentemente
	// para liberar o índice único antes de criar o novo
	var deletedUser models.User
	if err := database.DB.Unscoped().Where("email = ? AND deleted_at IS NOT NULL", input.Email).First(&deletedUser).Error; err == nil {
		database.DB.Unscoped().Delete(&deletedUser)
	}

	// Verificar se ainda existe usuário ativo com esse email
	var existingUser models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já registrado por um usuário ativo"})
		return
	}

	user := models.User{
		Nome:     input.Nome,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     input.Role,
	}

	// Salva usuário
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já registrado"})
		return
	}

	// Associa à família se fornecido
	if input.FamiliaID != nil {
		var familia models.Familia
		if err := database.DB.First(&familia, input.FamiliaID).Error; err == nil {
			database.DB.Model(&user).Association("Familias").Append(&familia)
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuário registrado com sucesso"})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Não encontrado"})
		return
	}

	var input struct {
		Password  string `json:"password"`
		FamiliaID *uint  `json:"familia_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Password != "" {
		if len(input.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Senha curta"})
			return
		}
		hash, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.Password = string(hash)
	}

	// Atualiza Família: Limpa as atuais e adiciona a nova
	if input.FamiliaID != nil {
		database.DB.Model(&user).Association("Familias").Clear()
		var familia models.Familia
		if err := database.DB.First(&familia, input.FamiliaID).Error; err == nil {
			database.DB.Model(&user).Association("Familias").Append(&familia)
		}
	} else {
		// Se veio null, limpa (ex: virou admin)
		database.DB.Model(&user).Association("Familias").Clear()
	}

	database.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "Atualizado"})
}

func DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	// Evita auto-exclusão
	adminID, _ := getUsuarioIDFromContext(c)
	if uint(id) == adminID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Não pode excluir a si mesmo"})
		return
	}

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Excluído"})
}
