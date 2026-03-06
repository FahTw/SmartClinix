package main

import (
	"patient/handler"
	"patient/model"
	"patient/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. เชื่อมต่อ PostgreSQL (Supabase)
	dsn := "host=aws-1-ap-southeast-1.pooler.supabase.com user=postgres.efawsreegafuebccehef password=MDD_password160369 dbname=postgres port=5432 sslmode=require"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
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