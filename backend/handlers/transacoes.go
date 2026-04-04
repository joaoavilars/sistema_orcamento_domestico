package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/csv"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/models"
	"gorm.io/gorm"
)

func generateGroupID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 16)
	}
	return hex.EncodeToString(bytes)
}

func GetTransacoes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	mesStr := c.Query("mes")
	anoStr := c.Query("ano")

	var primeiroDia, ultimoDia time.Time

	// Prioridade: Intervalo de datas personalizado
	if startDateStr != "" && endDateStr != "" {
		var err error
		primeiroDia, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de start_date inválido. Use YYYY-MM-DD"})
			return
		}
		ultimoDia, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de end_date inválido. Use YYYY-MM-DD"})
			return
		}
		// Garante que pegue o dia inteiro do ultimo dia (até 23:59:59 se necessário, ou apenas comparando datas.
		// Como o banco salva com timestamp, o ideal é pegar até o final do dia ou comparar só a data.
		// Vamos assumir comparação simples por enquanto, mas ajustando para ultimo momento do dia pode ser útil.
		// Aqui vou manter simples, assumindo que o front manda até o dia correto.
		// Se precisar cobrir o ultimo dia inteiro caso tenha hora:
		// ultimoDia = ultimoDia.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		// Mas como o app parece ignorar hora na entrada (só data), vou deixar assim.

	} else if mesStr != "" && anoStr != "" {
		// Fallback: Mês e Ano
		mes, _ := strconv.Atoi(mesStr)
		ano, _ := strconv.Atoi(anoStr)
		primeiroDia = time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
		ultimoDia = primeiroDia.AddDate(0, 1, -1)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros obrigatórios: (start_date e end_date) OU (mes e ano)"})
		return
	}

	var transacoes []models.Transacao
	// Carrega Categoria e Usuario (para mostrar "por Quem")
	result := database.DB.
		Preload("Categoria").
		Preload("Usuario").
		Where("familia_id = ?", familiaID).
		Where("data_transacao BETWEEN ? AND ?", primeiroDia, ultimoDia).
		Order("data_transacao DESC").
		Find(&transacoes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, transacoes)
}

func GetAnosDisponiveis(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var anos []int
	database.DB.Model(&models.Transacao{}).
		Where("familia_id = ?", familiaID).
		Distinct("EXTRACT(YEAR FROM data_transacao)").
		Order("EXTRACT(YEAR FROM data_transacao) ASC").
		Pluck("EXTRACT(YEAR FROM data_transacao)", &anos)

	if len(anos) == 0 {
		anoAtual := time.Now().Year()
		anos = []int{anoAtual, anoAtual + 1}
	}
	c.JSON(http.StatusOK, anos)
}

func CreateTransacao(c *gin.Context) {
	type CreateInput struct {
		models.Transacao
		IsParcelado bool `json:"is_parcelado"`
		QtdParcelas int  `json:"qtd_parcelas"`
	}
	var input CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	usuarioID, ok := getUsuarioIDFromContext(c) // Pega quem está criando
	if !ok {
		return
	}

	var groupID string
	if input.IsParcelado && input.QtdParcelas > 1 {
		groupID = generateGroupID()
	}

	// Se a conta for cartão de crédito, avança a data para o mês seguinte
	// (a fatura do cartão é paga no mês posterior à compra)
	isCartao := false
	if input.ContaID != nil {
		var conta models.Conta
		if err := database.DB.First(&conta, input.ContaID).Error; err == nil && conta.Tipo == "cartao" {
			isCartao = true
		}
	}

	if !input.IsParcelado || input.QtdParcelas < 2 {
		t := input.Transacao
		t.FamiliaID = familiaID
		t.UsuarioID = &usuarioID // Salva o dono
		t.GroupID = ""

		if isCartao {
			t.DataTransacao = t.DataTransacao.AddDate(0, 1, 0)
			t.Status = "pendente"
		}

		if err := database.DB.Create(&t).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// Recarrega para trazer nomes
		database.DB.Preload("Categoria").Preload("Usuario").First(&t, t.ID)
		c.JSON(http.StatusCreated, t)
		return
	}

	var transacoesCriadas []models.Transacao
	nomeOriginal := input.Nome
	dataOriginal := input.DataTransacao
	if isCartao {
		dataOriginal = dataOriginal.AddDate(0, 1, 0)
	}
	statusOriginal := input.Status

	for i := 0; i < input.QtdParcelas; i++ {
		t := input.Transacao
		t.FamiliaID = familiaID
		t.UsuarioID = &usuarioID
		t.GroupID = groupID
		t.Nome = fmt.Sprintf("%s (%d/%d)", nomeOriginal, i+1, input.QtdParcelas)
		t.DataTransacao = dataOriginal.AddDate(0, i, 0)
		if isCartao || i > 0 {
			t.Status = "pendente"
		} else {
			t.Status = statusOriginal
		}

		if err := database.DB.Create(&t).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		transacoesCriadas = append(transacoesCriadas, t)
	}
	c.JSON(http.StatusCreated, transacoesCriadas[0])
}

func PagarEmMassa(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var input struct {
		ContaID uint `json:"conta_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "conta_id é obrigatório"})
		return
	}

	// Garante que a conta pertence à família
	var conta models.Conta
	if err := database.DB.Where("id = ? AND familia_id = ?", input.ContaID, familiaID).First(&conta).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	// Marca todas as despesas pendentes vinculadas a essa conta como pagas
	result := database.DB.Model(&models.Transacao{}).
		Where("conta_id = ? AND familia_id = ? AND tipo = 'despesa' AND status = 'pendente'", input.ContaID, familiaID).
		Update("status", "pago")

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar transações"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Transações pagas com sucesso",
		"atualizadas": result.RowsAffected,
	})
}

func UpdateTransacao(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")

	var transacaoOriginal models.Transacao
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacaoOriginal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	type UpdateInput struct {
		models.Transacao
		EditMode string `json:"edit_mode"`
	}
	var input UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.EditMode != "future" || transacaoOriginal.GroupID == "" {
		transacaoOriginal.Nome = input.Nome
		transacaoOriginal.Valor = input.Valor
		transacaoOriginal.CategoriaID = input.CategoriaID
		transacaoOriginal.DataTransacao = input.DataTransacao
		transacaoOriginal.Status = input.Status
		transacaoOriginal.Tipo = input.Tipo
		transacaoOriginal.ContaID = input.ContaID
		transacaoOriginal.FormaPagamento = input.FormaPagamento
		if err := database.DB.Save(&transacaoOriginal).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Edição em lote
		database.DB.Model(&models.Transacao{}).
			Where("group_id = ? AND familia_id = ? AND data_transacao >= ?", transacaoOriginal.GroupID, familiaID, transacaoOriginal.DataTransacao).
			Updates(map[string]interface{}{
				"valor":        input.Valor,
				"categoria_id": input.CategoriaID,
				"tipo":         input.Tipo,
			})
		// Atualiza a atual explicitamente
		transacaoOriginal.Nome = input.Nome
		transacaoOriginal.Valor = input.Valor
		transacaoOriginal.CategoriaID = input.CategoriaID
		transacaoOriginal.DataTransacao = input.DataTransacao
		transacaoOriginal.Status = input.Status
		database.DB.Save(&transacaoOriginal)
	}

	database.DB.Preload("Categoria").Preload("Usuario").First(&transacaoOriginal, transacaoOriginal.ID)
	c.JSON(http.StatusOK, transacaoOriginal)
}

func UpdateTransacaoStatus(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status obrigatório"})
		return
	}
	database.DB.Model(&models.Transacao{}).Where("id = ? AND familia_id = ?", id, familiaID).Update("status", input.Status)
	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado"})
}

func DeleteTransacao(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	deleteMode := c.Query("delete_mode")

	var transacao models.Transacao
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacao).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	var result *gorm.DB
	if deleteMode == "future" && transacao.GroupID != "" {
		result = database.DB.Where("group_id = ? AND familia_id = ? AND data_transacao >= ?", transacao.GroupID, familiaID, transacao.DataTransacao).Delete(&models.Transacao{})
	} else {
		result = database.DB.Delete(&transacao)
	}

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Excluído com sucesso"})
}

func TransferirProximoMes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")

	var transacao models.Transacao
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacao).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}

	// Verifica se a transação está pendente (dívida não paga)
	if transacao.Status != "pendente" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Apenas transações pendentes podem ser transferidas"})
		return
	}

	// Calcula a nova data: mesmo dia, mês seguinte
	novaData := transacao.DataTransacao.AddDate(0, 1, 0)

	// Atualiza a data da transação
	transacao.DataTransacao = novaData

	if err := database.DB.Save(&transacao).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Recarrega com relacionamentos
	database.DB.Preload("Categoria").Preload("Usuario").First(&transacao, transacao.ID)
	c.JSON(http.StatusOK, transacao)
}

func ExportTransacoes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var transacoes []models.Transacao
	database.DB.Preload("Categoria").Preload("Usuario").Where("familia_id = ?", familiaID).Where("data_transacao BETWEEN ? AND ?", primeiroDia, ultimoDia).Order("data_transacao ASC").Find(&transacoes)

	b := &bytes.Buffer{}
	b.Write([]byte{0xEF, 0xBB, 0xBF}) // BOM
	w := csv.NewWriter(b)
	w.Comma = ';'
	w.Write([]string{"Data", "Nome", "Categoria", "Tipo", "Valor", "Status", "Criado Por"})

	for _, t := range transacoes {
		valorFmt := strings.Replace(fmt.Sprintf("%.2f", t.Valor), ".", ",", 1)
		cat := "Sem Categoria"
		if t.Categoria.ID != 0 {
			cat = t.Categoria.Nome
		}
		user := "Sistema"
		if t.Usuario.ID != 0 {
			user = t.Usuario.Nome
		}

		w.Write([]string{
			t.DataTransacao.Format("02/01/2006"),
			t.Nome,
			cat,
			t.Tipo,
			valorFmt,
			t.Status,
			user,
		})
	}
	w.Flush()
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=transacoes_%02d_%d.csv", mes, ano))
	c.Data(http.StatusOK, "text/csv", b.Bytes())
}
