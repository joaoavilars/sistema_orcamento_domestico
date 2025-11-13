package models

import (
	"time"

	"gorm.io/gorm"
)

// --- NOVA TABELA ---
// Familia (Household/Tenant)
type Familia struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nome      string    `gorm:"size:100;not null;unique" json:"nome"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName especifica o nome da tabela para GORM
func (Familia) TableName() string {
	return "familias"
}

// --- FIM DA NOVA TABELA ---

// Usuario (User)
type Usuario struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Email     string `gorm:"unique;not null" json:"email"`
	SenhaHash string `gorm:"not null" json:"-"`
	Role      string `gorm:"size:10;not null;default:'user'" json:"role"` // 'admin' ou 'user'

	// --- MUDANÇA ---
	// O familia_id é "ponteiro" (*uint) para ser "nullable" (nulo)
	// O admin@admin.com terá familia_id = NULL
	FamiliaID *uint    `gorm:"index" json:"familia_id"`
	Familia   *Familia `gorm:"foreignKey:FamiliaID" json:"familia"` // Referência opcional
	// --- FIM DA MUDANÇA ---

	CreatedAt time.Time `json:"created_at"`
	// Categorias e Transacoes não são mais ligados diretamente ao usuário
}

// Categoria (Category)
type Categoria struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Nome   string `gorm:"size:100;not null" json:"nome"`
	CorHex string `gorm:"size:7" json:"cor_hex"`

	// --- MUDANÇA ---
	// Removemos UsuarioID e adicionamos FamiliaID
	FamiliaID uint    `gorm:"not null;index" json:"familia_id"`
	Familia   Familia `gorm:"foreignKey:FamiliaID" json:"-"`
	// --- FIM DA MUDANÇA ---
}

func (Categoria) TableName() string {
	return "categorias"
}

// Transacao (Transaction)
type Transacao struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	CategoriaID   uint           `gorm:"not null" json:"categoria_id"`
	Categoria     Categoria      `gorm:"foreignKey:CategoriaID" json:"categoria"`
	Nome          string         `gorm:"size:255;not null" json:"nome"`
	Valor         float64        `gorm:"type:decimal(10,2);not null" json:"valor"`
	Tipo          string         `gorm:"size:10;not null;check:tipo IN ('receita', 'despesa')" json:"tipo"`
	Status        string         `gorm:"size:10;not null;default:'pendente'" json:"status"`
	DataTransacao time.Time      `gorm:"type:date;not null" json:"data_transacao"`
	CreatedAt     time.Time      `json:"created_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// --- MUDANÇA ---
	// Removemos UsuarioID e adicionamos FamiliaID
	FamiliaID uint    `gorm:"not null;index" json:"familia_id"`
	Familia   Familia `gorm:"foreignKey:FamiliaID" json:"-"`
	// --- FIM DA MUDANÇA ---
}

func (Transacao) TableName() string {
	return "transacoes"
}

type TransacaoRecorrente struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	UsuarioID     uint    `gorm:"not null" json:"usuario_id"`
	CategoriaID   uint    `gorm:"not null" json:"categoria_id"`
	Nome          string  `gorm:"size:255;not null" json:"nome"`
	Valor         float64 `gorm:"type:decimal(10,2);not null" json:"valor"`
	Tipo          string  `gorm:"size:10;not null;check:tipo IN ('receita', 'despesa')" json:"tipo"`
	Frequencia    string  `gorm:"size:20;not null" json:"frequencia"`
	DiaVencimento int     `gorm:"not null" json:"dia_vencimento"`
}
