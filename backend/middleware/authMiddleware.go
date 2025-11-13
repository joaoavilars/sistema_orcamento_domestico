package middleware

import (
	"log"
	"net/http"
	"os"
	"strings" // <-- Importa o pacote "strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/seu-usuario/orcamento-app/database" // Importa o database
	"github.com/seu-usuario/orcamento-app/handlers"
	"github.com/seu-usuario/orcamento-app/models" // Importa os models
)

var jwtKey = []byte(os.Getenv("JWT_SECRET"))

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// --- INÍCIO DO CÓDIGO FALTANTE ---
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização não fornecido"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato do token inválido"})
			c.Abort()
			return
		}
		// --- FIM DO CÓDIGO FALTANTE ---

		claims := &handlers.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			log.Println("Token inválido:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
			c.Abort()
			return
		}

		// --- MUDANÇA: BUSCAR FAMILIA ID ---
		var user models.Usuario
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário do token não encontrado"})
			c.Abort()
			return
		}

		// Armazena ID do Usuário, Role e ID da Família no contexto
		c.Set("usuarioID", user.ID)
		c.Set("usuarioRole", user.Role)

		if user.FamiliaID != nil {
			c.Set("familiaID", *user.FamiliaID)
		} else {
			// Se familia_id for nulo (ex: admin), colocamos 0
			c.Set("familiaID", uint(0))
		}
		// --- FIM DA MUDANÇA ---

		c.Next()
	}
}
