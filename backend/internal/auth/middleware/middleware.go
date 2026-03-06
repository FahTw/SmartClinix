package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. ดึงข้อมูลจาก Header ที่ชื่อว่า Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่มีตั๋วผ่านประตู"})
			c.Abort()
			return
		}

		// 2. แยกคำว่า "Bearer" ออกจากตัว Token จริงๆ
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

        // 3. ตรวจสอบ Token ว่าของจริงไหม หมดอายุหรือยัง

		c.Next()
	}
}