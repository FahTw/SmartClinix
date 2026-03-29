package main

import (
	"context"
	"log"
	"medical_records/config"
	"medical_records/database"
	"medical_records/handler"
	"medical_records/messaging"
	"medical_records/model"
	"medical_records/repository"
	"os"
	"time"

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
	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://guest:guest@rabbitmq:5672/"
	}

	// Start appointment event consumer
	consumer := messaging.NewAppointmentEventConsumer(rabbitMQURL, medicalRecordRepo)
	go func() {
		for {
			err := consumer.ConsumeAppointmentEvents(context.Background())
			if err != nil {
				log.Printf("❌ Consumer error: %v", err)
			}

			// Retry forever because RabbitMQ may not be ready on first startup.
			log.Println("⏳ Reconnecting consumer in 5s...")
			time.Sleep(5 * time.Second)
		}
	}()

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
