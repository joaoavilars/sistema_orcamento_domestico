package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

// AdminMiddleware verifica se o usuário logado é um admin
// Este middleware DEVE rodar DEPOIS do AuthMiddleware
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Pega o ID do usuário que o AuthMiddleware colocou no contexto
		usuarioIDInterface, exists := c.Get("usuarioID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado no contexto"})
			c.Abort()
			return
		}
		usuarioID := usuarioIDInterface.(uint)

		// Busca o usuário no banco para verificar sua role
		var user models.Usuario
		if err := database.DB.First(&user, usuarioID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
			c.Abort()
			return
		}

		// A Verificação
		if user.Role != "admin" {
			log.Printf("Usuário (ID: %d) tentou acessar rota de admin sem permissão.", user.ID)
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Requer privilégios de administrador."})
			c.Abort()
			return
		}

		// Se for admin, continua
		c.Next()
	}
}
