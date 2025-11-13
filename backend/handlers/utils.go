package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// getUsuarioIDFromContext é uma função helper para pegar o ID do usuário
// que o middleware de autenticação injetou.
func getUsuarioIDFromContext(c *gin.Context) (uint, bool) {
	usuarioIDInterface, exists := c.Get("usuarioID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado no contexto"})
		return 0, false
	}

	usuarioID, ok := usuarioIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tipo de ID do usuário inválido no contexto"})
		return 0, false
	}

	return usuarioID, true
}

func getFamiliaIDFromContext(c *gin.Context) (uint, bool) {
	familiaIDInterface, exists := c.Get("familiaID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Família não autenticada no contexto"})
		return 0, false
	}

	familiaID, ok := familiaIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Tipo de ID da família inválido no contexto"})
		return 0, false
	}

	// Se o ID for 0 (admin ou usuário sem família), bloqueia
	if familiaID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Usuário não está associado a nenhuma família"})
		return 0, false
	}

	return familiaID, true
}
