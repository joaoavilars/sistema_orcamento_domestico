package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/seu-usuario/orcamento-app/handlers"
	"github.com/seu-usuario/orcamento-app/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost", "http://localhost:3000", "http://localhost:8083"} // Adicione seu domínio
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "X-Familia-ID"} // <-- Importante
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		api.POST("/login", handlers.LoginUser)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/categorias", handlers.GetCategorias)
			protected.POST("/categorias", handlers.CreateCategoria)
			protected.PUT("/categorias/:id", handlers.UpdateCategoria)
			protected.DELETE("/categorias/:id", handlers.DeleteCategoria)

			protected.GET("/transacoes", handlers.GetTransacoes)
			protected.GET("/transacoes/anos", handlers.GetAnosDisponiveis)
			protected.GET("/transacoes/export", handlers.ExportTransacoes)
			protected.POST("/transacoes", handlers.CreateTransacao)
			protected.PUT("/transacoes/:id", handlers.UpdateTransacao)
			protected.DELETE("/transacoes/:id", handlers.DeleteTransacao)
			protected.PATCH("/transacoes/:id/status", handlers.UpdateTransacaoStatus)
			protected.POST("/transacoes/:id/transferir-proximo-mes", handlers.TransferirProximoMes)

			protected.GET("/dashboard/sumario", handlers.GetDashboardSumario)
			protected.GET("/dashboard/pizza-categorias", handlers.GetDashboardPizzaCategorias)
			protected.GET("/dashboard/colunas-balanco", handlers.GetDashboardColunasBalanco)
			protected.GET("/dashboard/categorias-anual", handlers.GetDashboardCategoriasAnual)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			admin.POST("/register", handlers.CreateUser) // Alterei o nome da func para CreateUser no handlers/usuarios.go
			admin.GET("/users", handlers.ListUsers)
			admin.PUT("/users/:id", handlers.UpdateUser)
			admin.DELETE("/users/:id", handlers.DeleteUser)
			admin.GET("/familias", handlers.ListFamilias)
			admin.POST("/familias", handlers.CreateFamilia)
		}
	}
	return r
}
