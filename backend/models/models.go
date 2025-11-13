package models

import (
	"time"

	"gorm.io/gorm"
)

// Usuario (User)
type Usuario struct {
	ID         uint        `gorm:"primaryKey" json:"id"`
	Email      string      `gorm:"unique;not null" json:"email"`
	SenhaHash  string      `gorm:"not null" json:"-"`                           // Não expor na API
	Role       string      `gorm:"size:10;not null;default:'user'" json:"role"` // 'admin' ou 'user'
	CreatedAt  time.Time   `json:"created_at"`
	Categorias []Categoria `gorm:"foreignKey:UsuarioID" json:"-"`
	Transacoes []Transacao `gorm:"foreignKey:UsuarioID" json:"-"`
}

// Categoria (Category)
type Categoria struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	UsuarioID uint   `gorm:"not null" json:"usuario_id"`
	Nome      string `gorm:"size:100;not null" json:"nome"`
	CorHex    string `gorm:"size:7" json:"cor_hex"`
}

func (Categoria) TableName() string {
	return "categorias"
}

// Transacao (Transaction)
type Transacao struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UsuarioID     uint           `gorm:"not null" json:"usuario_id"`
	CategoriaID   uint           `gorm:"not null" json:"categoria_id"`
	Categoria     Categoria      `gorm:"foreignKey:CategoriaID" json:"categoria"` // Eager load
	Nome          string         `gorm:"size:255;not null" json:"nome"`
	Valor         float64        `gorm:"type:decimal(10,2);not null" json:"valor"`
	Tipo          string         `gorm:"size:10;not null;check:tipo IN ('receita', 'despesa')" json:"tipo"`
	Status        string         `gorm:"size:10;not null;default:'pendente'" json:"status"`
	DataTransacao time.Time      `gorm:"type:date;not null" json:"data_transacao"`
	CreatedAt     time.Time      `json:"created_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Transacao) TableName() string {
	return "transacoes"
}

// TransacaoRecorrente (Bonus)
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
