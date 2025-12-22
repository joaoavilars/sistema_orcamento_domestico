package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioIDInterface, exists := c.Get("usuarioID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado no contexto"})
			c.Abort()
			return
		}
		usuarioID := usuarioIDInterface.(uint)

		var user models.User
		if err := database.DB.First(&user, usuarioID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			c.Abort()
			return
		}

		if user.Role != "admin" {
			log.Printf("Usuário (ID: %d) tentou acessar rota de admin.", user.ID)
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Requer privilégios de administrador."})
			c.Abort()
			return
		}

		c.Next()
	}
}
