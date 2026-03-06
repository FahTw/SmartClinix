package main

import (
	"patient/handler"
	"patient/model"
	"patient/repository"
	"patient/config"
	"patient/database"
	"log"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. โหลด Config จาก Environment Variables
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	db, err := database.NewPostgresConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 2. Auto Migrate
	db.AutoMigrate(&model.Patient{})

	// 3. เริ่มใช้งาน Repository (คุยกับ DB)
	patientRepo := repository.NewPatientRepository(db)

	// 4. เริ่มใช้งาน Handler (ส่ง Repo ให้ Handler ไปใช้)
	patientHandler := handler.NewPatientHandler(patientRepo)

	// 5. ตั้งค่า Gin Router และผูกเส้นทาง (Routes) ให้เรียกใช้ Handler
	r := gin.Default()

	r.POST("/patients", patientHandler.Create)
	r.GET("/patients", patientHandler.GetAll)
	r.GET("/patients/:id", patientHandler.GetByID)
	r.PUT("/patients/:id", patientHandler.Update)
	r.DELETE("/patients/:id", patientHandler.Delete)

	// 6. รัน Server
	r.Run(":8080")
}
