package config

import (
	"fmt"
	"log"
	"github.com/joho/godotenv"
	"os"
)

type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
	SSLMode  string
}

type ServerConfig struct {
	Port string
}

type Config struct {
	Database  DatabaseConfig
	JWTSecret string
	Server    ServerConfig
}

func LoadConfig() (*Config, error) {

	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}
	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "postgres"),
			Port:     getEnv("DB_PORT", "5432"),
			SSLMode:  getEnv("SSL_MODE", getEnv("DB_SSLMODE", "require")),
		},
		JWTSecret: getEnv("JWT_SECRET", "my-default-jwt-secret-key"),
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
	}

	if config.Database.Password == "" {
		return nil, fmt.Errorf("DB_PASSWORD is required")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
