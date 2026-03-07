package main

import (
	"log"
	"patient/config"
	"patient/database"
	"patient/handler"
	"patient/model"
	"patient/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. โหลด Config จาก Environment Variables
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. เชื่อมต่อฐานข้อมูล
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 3. Auto Migrate
	db.AutoMigrate(&model.Patient{})

	// 4. เริ่มใช้งาน Repository (คุยกับ DB)
	patientRepo := repository.NewPatientRepository(db)

	// 5. เริ่มใช้งาน Handler (ส่ง Repo ให้ Handler ไปใช้)
	patientHandler := handler.NewPatientHandler(patientRepo)

	// 6. ตั้งค่า Gin Router และผูกเส้นทาง (Routes) ให้เรียกใช้ Handler
	r := gin.Default()

	// CORS Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	r.POST("/patients", patientHandler.Create)
	r.GET("/patients", patientHandler.GetAll)
	r.GET("/patients/:id", patientHandler.GetByID)
	r.PUT("/patients/:id", patientHandler.Update)
	r.DELETE("/patients/:id", patientHandler.Delete)

	// 7. รัน Server
	log.Printf("🚀 Patient Service running on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}
