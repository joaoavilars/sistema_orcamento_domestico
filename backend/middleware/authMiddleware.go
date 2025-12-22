package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		secret := os.Getenv("JWT_SECRET")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("método de assinatura inesperado")
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Erro nos claims"})
			return
		}

		// 1. Extrai UserID do token
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "ID do usuário não encontrado no token"})
			return
		}
		userID := uint(userIDFloat)

		// Salva no contexto
		c.Set("usuarioID", userID)

		// 2. Lógica Multi-Família
		headerFamiliaID := c.GetHeader("X-Familia-ID")
		var familiaID uint

		if headerFamiliaID != "" && headerFamiliaID != "undefined" && headerFamiliaID != "null" {
			id, err := strconv.Atoi(headerFamiliaID)
			if err == nil {
				familiaID = uint(id)
			}
		}

		// 3. Validação de Segurança
		if familiaID > 0 {
			var count int64
			// Verifica na tabela de junção se o usuário pertence à família
			database.DB.Table("user_familias").
				Where("user_id = ? AND familia_id = ?", userID, familiaID).
				Count(&count)

			if count > 0 {
				c.Set("familiaID", familiaID)
			} else {
				// Se o usuário é admin, ele pode acessar qualquer família (opcional, mas útil para debug)
				// Vamos manter restrito por enquanto: se não é membro, 403.
				// A MENOS que seja um admin tentando criar coisas globais, mas aqui é contexto de família.
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Acesso negado a esta família"})
				return
			}
		} else {
			// Fallback: Tenta pegar a primeira família do usuário
			var user models.User
			// Preload é importante aqui
			if err := database.DB.Preload("Familias").First(&user, userID).Error; err == nil {
				if len(user.Familias) > 0 {
					c.Set("familiaID", user.Familias[0].ID)
				}
			}
		}

		c.Next()
	}
}
