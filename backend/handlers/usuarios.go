package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// ListUsers - GET /admin/users
func ListUsers(c *gin.Context) {
	var users []models.Usuario
	// Seleciona apenas campos seguros (sem o hash da senha)
	if err := database.DB.Select("id", "email", "role", "created_at").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

// DeleteUser - DELETE /admin/users/:id
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
