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

func GetDashboardCategoriasAnual(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	ano, _ := strconv.Atoi(c.Query("ano"))
	categoriasIDs := c.QueryArray("categorias")

	if len(categoriasIDs) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	mesesPtBr := [...]string{"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"}

	type CategoriaInfo struct {
		ID    uint   `json:"id"`
		Nome  string `json:"nome"`
		Cor   string `json:"cor"`
		Tipo  string `json:"tipo"`
	}

	type QueryRes struct {
		CategoriaID uint
		MesNum      int
		Total       float64
		Nome        string
		Cor         string
		Tipo        string
	}

	var qRes []QueryRes
	query := database.DB.Table("transacoes AS t").
		Select("t.categoria_id, EXTRACT(MONTH FROM t.data_transacao) AS mes_num, SUM(t.valor) AS total, c.nome, c.cor_hex AS cor, t.tipo").
		Joins("JOIN categorias AS c ON c.id = t.categoria_id").
		Where("t.familia_id = ? AND EXTRACT(YEAR FROM t.data_transacao) = ? AND t.deleted_at IS NULL", familiaID, ano)

	if len(categoriasIDs) > 0 {
		query = query.Where("t.categoria_id IN ?", categoriasIDs)
	}

	query.Group("t.categoria_id, EXTRACT(MONTH FROM t.data_transacao), c.nome, c.cor_hex, t.tipo").Scan(&qRes)

	// Criar mapa de categorias
	categoriasMap := make(map[uint]CategoriaInfo)
	mesesData := make(map[int]map[uint]float64) // mes -> categoria_id -> valor

	// Inicializar estrutura de dados
	for i := 1; i <= 12; i++ {
		mesesData[i] = make(map[uint]float64)
	}

	// Processar resultados
	for _, r := range qRes {
		if r.MesNum >= 1 && r.MesNum <= 12 {
			categoriasMap[r.CategoriaID] = CategoriaInfo{
				ID:   r.CategoriaID,
				Nome: r.Nome,
				Cor:  r.Cor,
				Tipo: r.Tipo,
			}
			mesesData[r.MesNum][r.CategoriaID] = r.Total
		}
	}

	// Buscar informações de categorias que não têm dados ainda
	for _, catIDStr := range categoriasIDs {
		catID, _ := strconv.ParseUint(catIDStr, 10, 32)
		if _, exists := categoriasMap[uint(catID)]; !exists {
			type CatInfo struct {
				Nome string
				Cor  string
			}
			var catInfo CatInfo
			database.DB.Table("categorias").Select("nome, cor_hex AS cor").Where("id = ? AND familia_id = ?", catID, familiaID).Scan(&catInfo)
			if catInfo.Nome != "" {
				categoriasMap[uint(catID)] = CategoriaInfo{
					ID:   uint(catID),
					Nome: catInfo.Nome,
					Cor:  catInfo.Cor,
				}
			}
		}
	}

	// Montar resposta - formato compatível com recharts
	// Cada mês terá "mes" e cada categoria como propriedade direta
	var resultados []map[string]interface{}
	for i := 1; i <= 12; i++ {
		mesData := make(map[string]interface{})
		mesData["mes"] = mesesPtBr[i-1]
		
		// Adicionar valores das categorias
		for catID, valor := range mesesData[i] {
			catInfo := categoriasMap[catID]
			mesData[catInfo.Nome] = valor
		}
		
		// Garantir que todas as categorias selecionadas apareçam (mesmo com valor 0)
		for _, catIDStr := range categoriasIDs {
			catID, _ := strconv.ParseUint(catIDStr, 10, 32)
			if catInfo, exists := categoriasMap[uint(catID)]; exists {
				mesData[catInfo.Nome] = mesesData[i][uint(catID)] // Usa 0 se não existir
			}
		}
		resultados = append(resultados, mesData)
	}

	// Incluir informações das categorias na resposta
	type Response struct {
		Meses      []map[string]interface{} `json:"meses"`
		Categorias []CategoriaInfo           `json:"categorias"`
	}

	// Buscar informações de todas as categorias selecionadas
	var categoriasInfo []CategoriaInfo
	for _, catIDStr := range categoriasIDs {
		catID, _ := strconv.ParseUint(catIDStr, 10, 32)
		if catInfo, exists := categoriasMap[uint(catID)]; exists {
			categoriasInfo = append(categoriasInfo, catInfo)
		} else {
			// Se a categoria não tem dados, buscar informações básicas da tabela
			type CatInfo struct {
				Nome string
				Cor  string
			}
			var catInfo CatInfo
			database.DB.Table("categorias").Select("nome, cor_hex AS cor").Where("id = ? AND familia_id = ?", catID, familiaID).Scan(&catInfo)
			if catInfo.Nome != "" {
				categoriasInfo = append(categoriasInfo, CategoriaInfo{
					ID:   uint(catID),
					Nome: catInfo.Nome,
					Cor:  catInfo.Cor,
				})
			}
		}
	}

	c.JSON(http.StatusOK, Response{
		Meses:      resultados,
		Categorias: categoriasInfo,
	})
}