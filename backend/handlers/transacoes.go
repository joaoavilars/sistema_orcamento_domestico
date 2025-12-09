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

// Helper para gerar um ID aleatório curto para o grupo
func generateGroupID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 16) // Fallback
	}
	return hex.EncodeToString(bytes)
}

// GetTransacoes - GET /transacoes
func GetTransacoes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	if mesStr == "" || anoStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'mes' e 'ano' são obrigatórios"})
		return
	}
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)
	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var transacoes []models.Transacao

	result := database.DB.
		Preload("Categoria").
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

// GetAnosDisponiveis - GET /transacoes/anos
func GetAnosDisponiveis(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	var anos []int
	err := database.DB.Model(&models.Transacao{}).
		Where("familia_id = ?", familiaID).
		Distinct("EXTRACT(YEAR FROM data_transacao)").
		Order("EXTRACT(YEAR FROM data_transacao) ASC").
		Pluck("EXTRACT(YEAR FROM data_transacao)", &anos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(anos) == 0 {
		anoAtual := time.Now().Year()
		anos = []int{anoAtual, anoAtual + 1}
	}

	c.JSON(http.StatusOK, anos)
}

// CreateTransacao - POST /transacoes
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

	var groupID string
	if input.IsParcelado && input.QtdParcelas > 1 {
		groupID = generateGroupID()
	}

	if !input.IsParcelado || input.QtdParcelas < 2 {
		transacao := input.Transacao
		transacao.FamiliaID = familiaID
		transacao.GroupID = ""

		if err := database.DB.Create(&transacao).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		database.DB.Preload("Categoria").First(&transacao, transacao.ID)
		c.JSON(http.StatusCreated, transacao)
		return
	}

	var transacoesCriadas []models.Transacao
	nomeOriginal := input.Nome
	dataOriginal := input.DataTransacao
	statusOriginal := input.Status

	for i := 0; i < input.QtdParcelas; i++ {
		t := input.Transacao
		t.FamiliaID = familiaID
		t.GroupID = groupID

		t.Nome = fmt.Sprintf("%s (%d/%d)", nomeOriginal, i+1, input.QtdParcelas)
		t.DataTransacao = dataOriginal.AddDate(0, i, 0)

		if i > 0 {
			t.Status = "pendente"
		} else {
			t.Status = statusOriginal
		}

		if err := database.DB.Create(&t).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar parcelas: " + err.Error()})
			return
		}
		transacoesCriadas = append(transacoesCriadas, t)
	}

	c.JSON(http.StatusCreated, transacoesCriadas[0])
}

// UpdateTransacao - PUT /transacoes/:id
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
		EditMode string `json:"edit_mode"` // "single" ou "future"
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

		if err := database.DB.Save(&transacaoOriginal).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		result := database.DB.Model(&models.Transacao{}).
			Where("group_id = ? AND familia_id = ? AND data_transacao >= ?", transacaoOriginal.GroupID, familiaID, transacaoOriginal.DataTransacao).
			Updates(map[string]interface{}{
				"valor":        input.Valor,
				"categoria_id": input.CategoriaID,
				"tipo":         input.Tipo,
			})

		transacaoOriginal.Nome = input.Nome
		transacaoOriginal.Valor = input.Valor
		transacaoOriginal.CategoriaID = input.CategoriaID
		transacaoOriginal.DataTransacao = input.DataTransacao
		transacaoOriginal.Status = input.Status
		database.DB.Save(&transacaoOriginal)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
	}

	database.DB.Preload("Categoria").First(&transacaoOriginal, transacaoOriginal.ID)
	c.JSON(http.StatusOK, transacaoOriginal)
}

// UpdateTransacaoStatus - PATCH /transacoes/:id/status
func UpdateTransacaoStatus(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}
	result := database.DB.Model(&models.Transacao{}).
		Where("id = ? AND familia_id = ?", id, familiaID).
		Update("status", input.Status)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado"})
}

// DeleteTransacao - DELETE /transacoes/:id
// --- ATUALIZADA COM LÓGICA DE EXCLUSÃO EM LOTE ---
func DeleteTransacao(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	id := c.Param("id")
	deleteMode := c.Query("delete_mode") // Lê o parâmetro ?delete_mode=...

	// Primeiro, precisamos buscar a transação para saber o GroupID e a Data
	var transacao models.Transacao
	if err := database.DB.Where("id = ? AND familia_id = ?", id, familiaID).First(&transacao).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada ou não pertence à família"})
		return
	}

	var result *gorm.DB

	if deleteMode == "future" && transacao.GroupID != "" {
		// Deletar esta e futuras do mesmo grupo
		result = database.DB.Where("group_id = ? AND familia_id = ? AND data_transacao >= ?", transacao.GroupID, familiaID, transacao.DataTransacao).Delete(&models.Transacao{})
	} else {
		// Deletar apenas esta (padrão)
		result = database.DB.Delete(&transacao)
	}

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transação(ões) excluída(s) com sucesso"})
}
func ExportTransacoes(c *gin.Context) {
	familiaID, ok := getFamiliaIDFromContext(c)
	if !ok {
		return
	}

	mesStr := c.Query("mes")
	anoStr := c.Query("ano")
	if mesStr == "" || anoStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'mes' e 'ano' são obrigatórios"})
		return
	}
	mes, _ := strconv.Atoi(mesStr)
	ano, _ := strconv.Atoi(anoStr)

	primeiroDia := time.Date(ano, time.Month(mes), 1, 0, 0, 0, 0, time.UTC)
	ultimoDia := primeiroDia.AddDate(0, 1, -1)

	var transacoes []models.Transacao
	result := database.DB.
		Preload("Categoria").
		Where("familia_id = ?", familiaID).
		Where("data_transacao BETWEEN ? AND ?", primeiroDia, ultimoDia).
		Order("data_transacao ASC").
		Find(&transacoes)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// --- GERAÇÃO DO CSV ---
	b := &bytes.Buffer{}

	// DICA PRO: Adiciona o BOM (Byte Order Mark) para o Excel reconhecer UTF-8 (Acentos)
	b.Write([]byte{0xEF, 0xBB, 0xBF})

	w := csv.NewWriter(b)
	w.Comma = ';' // Ponto e vírgula é o separador padrão do Excel BR

	// Cabeçalho
	w.Write([]string{"Data", "Nome", "Categoria", "Tipo", "Valor", "Status"})

	for _, t := range transacoes {
		dataFmt := t.DataTransacao.Format("02/01/2006")

		// Formata com 2 casas decimais (padrão americano: 1000.50)
		valorFmt := fmt.Sprintf("%.2f", t.Valor)

		// --- A CORREÇÃO MÁGICA ---
		// Troca ponto por vírgula para o Excel BR entender como número (1000,50)
		valorFmt = strings.Replace(valorFmt, ".", ",", 1)
		// -------------------------

		categoriaNome := "Sem Categoria"
		if t.Categoria.ID != 0 {
			categoriaNome = t.Categoria.Nome
		}

		w.Write([]string{
			dataFmt,
			t.Nome,
			categoriaNome,
			t.Tipo,
			valorFmt, // Agora envia com vírgula
			t.Status,
		})
	}
	w.Flush()

	if err := w.Error(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar CSV"})
		return
	}

	filename := fmt.Sprintf("transacoes_%02d_%d.csv", mes, ano)
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "text/csv", b.Bytes())
}
