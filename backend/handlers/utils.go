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
