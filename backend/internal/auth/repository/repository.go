package repository

import (
	"auth/model"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type AuthRepository struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthRepository(db *gorm.DB, jwtSecret string) *AuthRepository {
	return &AuthRepository{db: db, jwtSecret: jwtSecret}
}

func (r *AuthRepository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *AuthRepository) GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *AuthRepository) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *AuthRepository) GenerateJWT(user *model.User) (string, error) {
	if r.jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET is not set")
	}

	claims := jwt.MapClaims{
		"sub":      user.ID,
		"username": user.Username,
		"role":     user.Role,
		"iat":      time.Now().Unix(),
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(r.jwtSecret))
}
