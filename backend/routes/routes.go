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
	config.AllowOrigins = []string{"http://localhost", "http://localhost:3000"} // Ajuste para seu domínio em produção
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Grupo /api principal
	api := r.Group("/api")
	{
		// --- ROTAS PÚBLICAS ---
		api.POST("/login", handlers.LoginUser)

		// --- ROTAS PROTEGIDAS (Usuário Comum) ---
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Categorias
			protected.GET("/categorias", handlers.GetCategorias)
			protected.POST("/categorias", handlers.CreateCategoria)
			protected.DELETE("/categorias/:id", handlers.DeleteCategoria)

			// Transações (Core)
			protected.GET("/transacoes", handlers.GetTransacoes)
			protected.POST("/transacoes", handlers.CreateTransacao)

			// --- AS DUAS ROTAS QUE FALTAVAM ---
			protected.PUT("/transacoes/:id", handlers.UpdateTransacao)
			protected.DELETE("/transacoes/:id", handlers.DeleteTransacao)
			// --- FIM DA CORREÇÃO ---

			protected.PATCH("/transacoes/:id/status", handlers.UpdateTransacaoStatus)

			// Dashboard
			protected.GET("/dashboard/sumario", handlers.GetDashboardSumario)
			protected.GET("/dashboard/pizza-categorias", handlers.GetDashboardPizzaCategorias)
			protected.GET("/dashboard/colunas-balanco", handlers.GetDashboardColunasBalanco)
		}

		// --- ROTAS DE ADMIN ---
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			// Usuários
			admin.POST("/register", handlers.RegisterUser)
			admin.GET("/users", handlers.ListUsers)
			admin.PUT("/users/:id", handlers.UpdateUser)
			admin.DELETE("/users/:id", handlers.DeleteUser)

			// Famílias
			admin.GET("/familias", handlers.ListFamilias)
			admin.POST("/familias", handlers.CreateFamilia)
		}
	}

	return r
}
