package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
)

// GetDashboardSumario - GET /dashboard/sumario
func GetDashboardSumario(c *gin.Context) {
	// TODO: Pegar usuario_id do token JWT
	usuarioID := 1 // Placeholder

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var totalReceitas, totalDespesas float64

	// Total Receitas
	database.DB.Table("transacoes").
		Where("usuario_id = ? AND tipo = 'receita' AND data_transacao BETWEEN ? AND ?", usuarioID, primeiroDia, ultimoDia).
		Select("COALESCE(SUM(valor), 0)").
		Row().
		Scan(&totalReceitas)

	// Total Despesas
	database.DB.Table("transacoes").
		Where("usuario_id = ? AND tipo = 'despesa' AND data_transacao BETWEEN ? AND ?", usuarioID, primeiroDia, ultimoDia).
		Select("COALESCE(SUM(valor), 0)").
		Row().
		Scan(&totalDespesas)

	saldo := totalReceitas - totalDespesas

	c.JSON(http.StatusOK, gin.H{
		"total_receitas": totalReceitas,
		"total_despesas": totalDespesas,
		"saldo":          saldo,
	})
}

// GetDashboardPizzaCategorias - GET /dashboard/pizza-categorias
func GetDashboardPizzaCategorias(c *gin.Context) {
	// TODO: Pegar usuario_id do token JWT
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return // A função helper já enviou a resposta de erro
	}

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	type ResultadoPizza struct {
		Nome  string  `json:"nome"`
		Total float64 `json:"total"`
		Cor   string  `json:"cor"`
	}
	var resultados []ResultadoPizza

	database.DB.Table("transacoes AS t").
		Select("c.nome, c.cor_hex AS cor, SUM(t.valor) AS total").
		Joins("JOIN categorias AS c ON c.id = t.categoria_id").
		Where("t.usuario_id = ? AND t.tipo = 'despesa' AND t.data_transacao BETWEEN ? AND ?", usuarioID, primeiroDia, ultimoDia).
		Group("c.nome, c.cor_hex").
		Order("total DESC").
		Scan(&resultados)

	c.JSON(http.StatusOK, resultados)
}

// GetDashboardColunasBalanco - GET /dashboard/colunas-balanco
func GetDashboardColunasBalanco(c *gin.Context) {
	// ... Implementação do balanço anual (consulta mais complexa, agrupando por mês) ...
	c.JSON(http.StatusOK, gin.H{"message": "Endpoint de balanço anual a ser implementado"})
}
