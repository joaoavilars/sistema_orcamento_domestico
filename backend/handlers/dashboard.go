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
	// --- MUDANÇA ---
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

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
	// --- MUDANÇA ---
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

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
	// --- MUDANÇA ---
	usuarioID, ok := getUsuarioIDFromContext(c)
	if !ok {
		return
	}
	// --- FIM DA MUDANÇA ---

	anoStr := c.Query("ano")
	ano, _ := strconv.Atoi(anoStr)

	type ResultadoColuna struct {
		Mes     string  `json:"mes"`
		Receita float64 `json:"receita"`
		Despesa float64 `json:"despesa"`
	}
	var resultados []ResultadoColuna
	// Mapeia o número do mês para o nome abreviado em Português
	mesesPtBr := [...]string{"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"}

	// Cria uma estrutura de "template" para os 12 meses com valores zerados
	resultadosMap := make(map[int]ResultadoColuna)
	for i := 1; i <= 12; i++ {
		resultadosMap[i] = ResultadoColuna{
			Mes:     mesesPtBr[i-1], // 'Jan', 'Fev', etc.
			Receita: 0,
			Despesa: 0,
		}
	}

	// Estrutura temporária para receber os dados do banco
	type ResultadoQuery struct {
		MesNum  int     `json:"mes_num"`
		Receita float64 `json:"receita"`
		Despesa float64 `json:"despesa"`
	}
	var queryResults []ResultadoQuery

	// Busca os dados agregados do banco
	database.DB.Table("transacoes").
		Select("EXTRACT(MONTH FROM data_transacao) AS mes_num, "+
			"SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) AS receita, "+
			"SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS despesa").
		Where("usuario_id = ? AND EXTRACT(YEAR FROM data_transacao) = ?", usuarioID, ano).
		Group("EXTRACT(MONTH FROM data_transacao)").
		Scan(&queryResults)

	// Preenche o "template" com os dados reais do banco
	for _, res := range queryResults {
		if res.MesNum >= 1 && res.MesNum <= 12 {
			mes := res.MesNum
			resultadosMap[mes] = ResultadoColuna{
				Mes:     mesesPtBr[mes-1],
				Receita: res.Receita,
				Despesa: res.Despesa,
			}
		}
	}

	// Converte o map para um slice (array) na ordem correta
	for i := 1; i <= 12; i++ {
		resultados = append(resultados, resultadosMap[i])
	}

	c.JSON(http.StatusOK, resultados)
}
