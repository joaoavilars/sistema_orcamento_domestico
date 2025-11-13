package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/seu-usuario/orcamento-app/database"
	"github.com/seu-usuario/orcamento-app/routes"
)

func main() {
	// Carregar .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: Não foi possível carregar o arquivo .env")
	}

	// Conectar ao DB
	database.Connect()

	// Configurar Rotas
	r := routes.SetupRouter()

	// Iniciar servidor
	log.Println("Iniciando servidor na porta 8080...")
	r.Run(":8080")
}
