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
	config.AllowOrigins = []string{"http://localhost", "http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Grupo /api principal
	api := r.Group("/api")
	{
		// --- ROTAS PÚBLICAS ---
		// /api/login
		api.POST("/login", handlers.LoginUser)
		// A rota /api/register PÚBLICA foi REMOVIDA

		// --- ROTAS PROTEGIDAS (Usuário Comum) ---
		// Requer apenas login (AuthMiddleware)
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
			// (Certifique-se de que os handlers de transacoes e dashboard
			// usam getUsuarioIDFromContext(c) e não o ID=1)

			// Dashboard
			protected.GET("/dashboard/sumario", handlers.GetDashboardSumario)
			protected.GET("/dashboard/pizza-categorias", handlers.GetDashboardPizzaCategorias)
			protected.GET("/dashboard/colunas-balanco", handlers.GetDashboardColunasBalanco)
		}

		// --- ROTAS DE ADMIN ---
		// Requer login (AuthMiddleware) E ser admin (AdminMiddleware)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			// /api/admin/register (O novo "Cadastrar Usuário")
			admin.POST("/register", handlers.RegisterUser)

			// /api/admin/users
			admin.GET("/users", handlers.ListUsers)
			admin.DELETE("/users/:id", handlers.DeleteUser)
		}
	}

	return r
}
