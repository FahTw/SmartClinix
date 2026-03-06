package config
import (
	"os"
)
type Config struct {
	Database DatabaseConfig
	JWTSecret string
	Server   ServerConfig
}
func LoadConfig() (*Config, error) {
	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "postgres"),
			Port:     getEnv("DB_PORT", "5432"),
			SSLMode:  getEnv("DB_SSLMODE", "require"),
		},
		JWTSecret: getEnv("JWT_SECRET", "defaultsecret"),
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
	}
	if config.Database.Password == "" {
		return nil, fmt.Errorf("DB_PASSWORD is required")
	}
	
	if config.JWTSecret == "defaultsecret" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	return config, nil
}
func getEnv(key, defaultValue string) string{
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}