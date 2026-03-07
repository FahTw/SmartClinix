package database

import (
	"auth/config"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewPostgresConnection(cfg *config.Config) (*gorm.DB, error) {
	// สร้าง DSN จาก config (ไม่ hardcode)
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)
	// เชื่อมต่อฐานข้อมูลพร้อม PrepareStmt เพื่อป้องกัน SQL Injection
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: true, // ป้องกัน SQL Injection
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
	
}
