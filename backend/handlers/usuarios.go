package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
	"golang.org/x/crypto/bcrypt" // Importe bcrypt
)

// ListUsers - GET /admin/users
func ListUsers(c *gin.Context) {
	var users []models.Usuario
	// Usa Preload para carregar o nome da família junto (JOIN)
	if err := database.DB.Preload("Familia").Select("id", "email", "role", "created_at", "familia_id").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// CreateUser - POST /admin/register
func CreateUser(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
		Role     string `json:"role" binding:"required"`
		// --- MUDANÇA: O nome do campo no JSON deve ser "familia_id" ---
		FamiliaID *uint `json:"familia_id"` // Aceita o ID da família (opcional)
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	// Regras de Negócio
	if input.Role == "user" && input.FamiliaID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuários padrão devem pertencer a uma família."})
		return
	}
	if input.Role == "admin" && input.FamiliaID != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Administradores não podem pertencer a famílias."})
		return
	}

	user := models.Usuario{
		Email:     input.Email,
		SenhaHash: string(hashedPassword),
		Role:      input.Role,
		FamiliaID: input.FamiliaID, // <-- Agora isso vai funcionar
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já registrado"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Usuário registrado com sucesso"})
}

// UpdateUser - PUT /admin/users/:id
func UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var user models.Usuario
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	var input struct {
		Password  string `json:"password"`   // Opcional
		FamiliaID *uint  `json:"familia_id"` // Opcional
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Atualiza a senha se ela foi fornecida
	if input.Password != "" {
		if len(input.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nova senha deve ter pelo menos 8 caracteres."})
			return
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		user.SenhaHash = string(hashedPassword)
	}

	// Atualiza a família
	// (Note: esta lógica simples não impede mover um admin para uma família)
	user.FamiliaID = input.FamiliaID

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao salvar usuário"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso"})
}

func DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuário inválido"})
		return
	}

	// Pega o ID do admin logado (para evitar auto-exclusão)
	adminID, _ := getUsuarioIDFromContext(c)
	if uint(id) == adminID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Não é permitido excluir a si mesmo."})
		return
	}

	// TODO: Verificar se o usuário tem transações/categorias antes de excluir,
	// ou usar GORM com `OnDelete: "CASCADE"` no modelo.
	// Por simplicidade, vamos apenas deletar.

	result := database.DB.Delete(&models.Usuario{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir usuário."})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário excluído com sucesso"})
}
