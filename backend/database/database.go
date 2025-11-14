package database

import (
	"log"
	"os"

	"github.com/seu-usuario/orcamento-app/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL não está definida no .env")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar ao banco de dados: ", err)
	}

	log.Println("Conexão com o banco de dados estabelecida.")

	// AutoMigrate
	err = DB.AutoMigrate(
		&models.Usuario{},
		&models.Categoria{},
		&models.Transacao{},
		&models.TransacaoRecorrente{},
	)
	if err != nil {
		log.Fatal("Falha ao rodar AutoMigrate: ", err)
	}

	log.Println("Migrations do banco de dados concluídas.")
	seedUser()
}

// seedUser cria um usuário padrão (ID=1) se ele não existir
func seedUser() {
	var userCount int64
	DB.Model(&models.Usuario{}).Count(&userCount)

	// Se já existir qualquer usuário, não faz nada
	if userCount > 0 {
		log.Println("Usuários já existem no banco. Seeder de admin pulado.")
		return
	}

	// Se o banco estiver vazio, cria o admin
	log.Println("Nenhum usuário encontrado, criando usuário admin padrão...")

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost) // Senha padrão

	defaultUser := models.Usuario{
		Email:     "admin@admin.com", // Email do Admin
		SenhaHash: string(hashedPassword),
		Role:      "admin", // Define a Role
	}

	if err := DB.Create(&defaultUser).Error; err != nil {
		log.Fatal("Falha ao criar usuário admin padrão: ", err)
	}

	log.Println("Usuário 'admin@admin.com' criado com sucesso.")
}
