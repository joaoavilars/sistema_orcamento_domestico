package models

import (
	"time"

	"gorm.io/gorm"
)

// User (Substitui o antigo Usuario)
type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Nome     string `gorm:"size:255;not null" json:"nome"`
	Email    string `gorm:"uniqueIndex;size:255;not null" json:"email"`
	Password string `gorm:"not null" json:"-"`          // Hash da senha
	Role     string `gorm:"default:'user'" json:"role"` // 'admin' ou 'user'

	// Relação Many-to-Many: Um usuário pode estar em várias famílias
	// A tabela de junção será criada automaticamente como 'user_familias'
	Familias []Familia `gorm:"many2many:user_familias;" json:"familias"`

	// Opcional: Se quiser saber qual é a "família ativa" padrão (não obrigatório, mas útil)
	FamiliaID *uint `gorm:"index" json:"familia_id"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Familia (Nova Entidade: Household/Tenant)
type Familia struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Nome      string         `gorm:"size:100;not null;unique" json:"nome"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Familia) TableName() string {
	return "familias"
}

// Categoria
type Categoria struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Nome   string `gorm:"size:100;not null" json:"nome"`
	CorHex string `gorm:"size:7;default:'#000000'" json:"cor_hex"`

	// Pertence a uma Família, não mais a um Usuário
	FamiliaID uint    `gorm:"not null;index" json:"familia_id"`
	Familia   Familia `gorm:"foreignKey:FamiliaID" json:"-"`
}

func (Categoria) TableName() string {
	return "categorias"
}

// Transacao
type Transacao struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// Pertence a uma Família
	FamiliaID uint    `gorm:"not null;index" json:"familia_id"`
	Familia   Familia `gorm:"foreignKey:FamiliaID" json:"-"`

	// Auditoria: Quem criou (User)
	// Auditoria: Quem criou (User)
	UsuarioID *uint `gorm:"index" json:"usuario_id"`
	Usuario   User  `gorm:"foreignKey:UsuarioID" json:"usuario"` // Preload traz os dados do user

	CategoriaID uint      `gorm:"not null" json:"categoria_id"`
	Categoria   Categoria `gorm:"foreignKey:CategoriaID" json:"categoria"`

	Nome          string    `gorm:"size:255;not null" json:"nome"`
	Valor         float64   `gorm:"type:decimal(10,2);not null" json:"valor"`
	Tipo          string    `gorm:"size:10;not null;check:tipo IN ('receita', 'despesa')" json:"tipo"`
	Status        string    `gorm:"size:10;not null;default:'pendente'" json:"status"`
	DataTransacao time.Time `gorm:"type:date;not null" json:"data_transacao"`

	GroupID string `gorm:"size:36;index" json:"group_id"`

	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Transacao) TableName() string {
	return "transacoes"
}
