package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// getUsuarioIDFromContext pega o ID do usuário logado (armazenado pelo middleware)
func getUsuarioIDFromContext(c *gin.Context) (uint, bool) {
	usuarioIDInterface, exists := c.Get("usuarioID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return 0, false
	}

	usuarioID, ok := usuarioIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno: ID do usuário inválido"})
		return 0, false
	}

	return usuarioID, true
}

// getFamiliaIDFromContext pega o ID da família selecionada (header X-Familia-ID)
func getFamiliaIDFromContext(c *gin.Context) (uint, bool) {
	familiaIDInterface, exists := c.Get("familiaID")
	if !exists {
		// Retorna 400 se o usuário não selecionou família (exceto se for admin em rota de admin)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhuma família selecionada. Por favor, selecione uma família no menu."})
		return 0, false
	}

	familiaID, ok := familiaIDInterface.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno: ID da família inválido"})
		return 0, false
	}

	// 0 indica que não há família selecionada ou válida para o contexto atual
	if familiaID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário não está associado a nenhuma família"})
		return 0, false
	}

	return familiaID, true
}
