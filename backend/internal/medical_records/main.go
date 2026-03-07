package main

import (
	"log"
	"medical_records/config"
	"medical_records/database"
	"medical_records/handler"
	"medical_records/model"
	"medical_records/repository"

	"github.com/gin-contrib/cors"
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

	db.AutoMigrate(&model.MedicalRecord{})

	medicalRecordRepo := repository.NewMedicalRecordRepository(db)

	medicalRecordHandler := handler.NewMedicalRecordHandler(medicalRecordRepo)
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))
	r.POST("/medical-records", medicalRecordHandler.Create)
	r.GET("/medical-records", medicalRecordHandler.GetAll)
	r.GET("/medical-records/:id", medicalRecordHandler.GetByID)
	r.PUT("/medical-records/:id", medicalRecordHandler.Update)
	r.DELETE("/medical-records/:id", medicalRecordHandler.Delete)

	r.Run(":8081")
}
