package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
)

func GetDashboardSumario(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	mes, _ := strconv.Atoi(c.Query("mes"))
	ano, _ := strconv.Atoi(c.Query("ano"))
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var totalReceitas, totalDespesas float64
	database.DB.Table("transacoes").Where("familia_id = ? AND tipo = 'receita' AND data_transacao BETWEEN ? AND ? AND deleted_at IS NULL", familiaID, primeiroDia, ultimoDia).Select("COALESCE(SUM(valor), 0)").Scan(&totalReceitas)
	database.DB.Table("transacoes").Where("familia_id = ? AND tipo = 'despesa' AND data_transacao BETWEEN ? AND ? AND deleted_at IS NULL", familiaID, primeiroDia, ultimoDia).Select("COALESCE(SUM(valor), 0)").Scan(&totalDespesas)

	c.JSON(http.StatusOK, gin.H{"total_receitas": totalReceitas, "total_despesas": totalDespesas, "saldo": totalReceitas - totalDespesas})
}

func GetDashboardPizzaCategorias(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	mes, _ := strconv.Atoi(c.Query("mes"))
	ano, _ := strconv.Atoi(c.Query("ano"))
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	type Res struct {
		Nome  string  `json:"nome"`
		Total float64 `json:"total"`
		Cor   string  `json:"cor"`
	}
	var resultados []Res
	database.DB.Table("transacoes AS t").Select("c.nome, c.cor_hex AS cor, SUM(t.valor) AS total").Joins("JOIN categorias AS c ON c.id = t.categoria_id").Where("t.familia_id = ? AND t.tipo = 'despesa' AND t.data_transacao BETWEEN ? AND ? AND t.deleted_at IS NULL", familiaID, primeiroDia, ultimoDia).Group("c.nome, c.cor_hex").Order("total DESC").Scan(&resultados)
	c.JSON(http.StatusOK, resultados)
}

func GetDashboardColunasBalanco(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	ano, _ := strconv.Atoi(c.Query("ano"))

	type Res struct {
		Mes     string  `json:"mes"`
		Receita float64 `json:"receita"`
		Despesa float64 `json:"despesa"`
	}
	var resultados []Res
	mesesPtBr := [...]string{"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"}
	resMap := make(map[int]Res)
	for i := 1; i <= 12; i++ {
		resMap[i] = Res{Mes: mesesPtBr[i-1]}
	}

	type QueryRes struct {
		MesNum  int
		Receita float64
		Despesa float64
	}
	var qRes []QueryRes
	database.DB.Table("transacoes").Select("EXTRACT(MONTH FROM data_transacao) AS mes_num, SUM(CASE WHEN tipo='receita' THEN valor ELSE 0 END) AS receita, SUM(CASE WHEN tipo='despesa' THEN valor ELSE 0 END) AS despesa").Where("familia_id = ? AND EXTRACT(YEAR FROM data_transacao) = ? AND deleted_at IS NULL", familiaID, ano).Group("EXTRACT(MONTH FROM data_transacao)").Scan(&qRes)

	for _, r := range qRes {
		if r.MesNum >= 1 && r.MesNum <= 12 {
			entry := resMap[r.MesNum]
			entry.Receita = r.Receita
			entry.Despesa = r.Despesa
			resMap[r.MesNum] = entry
		}
	}
	for i := 1; i <= 12; i++ {
		resultados = append(resultados, resMap[i])
	}
	c.JSON(http.StatusOK, resultados)
}
