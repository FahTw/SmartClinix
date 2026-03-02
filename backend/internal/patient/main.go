package main

import (
	"patient/model"
	"patient/repository"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. เชื่อมต่อ PostgreSQL
	dsn := "host=aws-1-ap-southeast-1.pooler.supabase.com user=postgres.efawsreegafuebccehef password=MDD_password160369 dbname=postgres port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database")
	}

	// 2. Auto Migrate (สร้าง Table อัตโนมัติจาก Model)
	db.AutoMigrate(&model.Patient{})

	// 3. เริ่มใช้งาน Repository
	patientRepo := repository.NewPatientRepository(db)

}