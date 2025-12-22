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
	// Cria ou atualiza as tabelas com base nos modelos (structs)
	err = DB.AutoMigrate(
		&models.User{},    // Atualizado de Usuario para User
		&models.Familia{}, // Nova tabela
		&models.Categoria{},
		&models.Transacao{},
		// &models.TransacaoRecorrente{}, // Se ainda estiver usando
	)
	if err != nil {
		log.Fatal("Falha ao rodar AutoMigrate: ", err)
	}

	log.Println("Migrations do banco de dados concluídas.")

	// Chama a função para criar o admin padrão
	seedUser()
}

// seedUser garante que o usuário admin exista
func seedUser() {
	// 1. Admin Default
	ensureUser("Administrador", "admin@admin.com", "admin123", "admin")

	// 2. Usuário Solicitado (João)
	//ensureUser("João Ávila", "joao.avila.rs@gmail.com", "123456", "admin")
}

func ensureUser(nome, email, defaultPassword, role string) {
	var user models.User
	result := DB.Where("email = ?", email).First(&user)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// Cria o user se não existir
			log.Printf("Usuário %s não encontrado, criando...\n", email)
			newUser := models.User{
				Nome:     nome,
				Email:    email,
				Password: string(hashedPassword),
				Role:     role,
			}
			if err := DB.Create(&newUser).Error; err != nil {
				log.Printf("Falha ao criar usuário %s: %v\n", email, err)
			} else {
				log.Printf("Usuário '%s' criado com sucesso. Senha: '%s'\n", email, defaultPassword)
			}
		} else {
			log.Printf("Erro ao verificar usuário %s: %v\n", email, result.Error)
		}
	} else {
		// Se existir, reseta a senha (útil para correção rápida)
		log.Printf("Usuário %s encontrado. Resetando senha...\n", email)
		user.Password = string(hashedPassword)
		DB.Save(&user)
		log.Printf("Senha do usuário '%s' resetada para '%s'.\n", email, defaultPassword)
	}
}
