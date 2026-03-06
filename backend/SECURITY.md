# ไฟล์อธิบายการปรับปรุงความปลอดภัยของการเชื่อมต่อฐานข้อมูล

## การเปลี่ยนแปลงที่ทำ

### 1. Environment Variables (.env)
- สร้างไฟล์ `.env` และ `.env.example` เพื่อจัดเก็บข้อมูลการเชื่อมต่อ
- **ไม่ hardcode password** ในโค้ดอีกต่อไป
- เพิ่ม `.gitignore` เพื่อไม่ให้ `.env` ถูก commit ลง Git

### 2. SSL/TLS Encryption
- **เปิดใช้งาน `sslmode=require`** ทุกที่ (ก่อนหน้า appointment ใช้ sslmode=disable)
- การเชื่อมต่อทั้งหมดเข้ารหัสด้วย SSL

### 3. SQL Injection Protection
- เพิ่ม `PrepareStmt: true` ใน GORM config
- ใช้ Prepared Statements เพื่อป้องกัน SQL Injection

### 4. Connection Pool Management
- ตั้งค่า `MaxIdleConns`, `MaxOpenConns`, และ `ConnMaxLifetime`
- ป้องกันการใช้ connection มากเกินไป (Resource exhaustion)

### 5. Error Handling
- ใช้ `log.Fatalf()` แทน `panic()` เพื่อให้ error message ชัดเจน
- ตรวจสอบ config และ connection ก่อนรันระบบ

## วิธีใช้งาน

### ติดตั้ง dependencies
```bash
cd backend/internal/patient
go get github.com/joho/godotenv

cd ../appointment
go get github.com/joho/godotenv
```

### ตั้งค่า Environment Variables
แก้ไขไฟล์ `backend/.env`:
```
DB_PASSWORD=your_actual_password_here
```

### รันแอพพลิเคชั่น
```bash
# Patient Service
cd backend/internal/patient
go run main.go

# Appointment Service  
cd backend/internal/appointment
go run main.go
```

## ความปลอดภัยที่ได้รับ

✅ **No Hardcoded Credentials** - ใช้ Environment Variables  
✅ **SSL/TLS Encryption** - การเชื่อมต่อเข้ารหัส  
✅ **SQL Injection Protection** - ใช้ Prepared Statements  
✅ **Connection Pool Limits** - จำกัดจำนวน connections  
✅ **Secure .gitignore** - ไม่ commit ข้อมูลลับลง Git  
✅ **Error Handling** - จัดการ error อย่างถูกต้อง  

## คำแนะนำเพิ่มเติม

1. **ใช้ secrets manager** ใน production (เช่น AWS Secrets Manager, HashiCorp Vault)
2. **Rotate passwords** เป็นประจำ
3. **ใช้ read-only users** สำหรับ queries ที่ไม่ต้องเขียนข้อมูล
4. **Enable database audit logs** เพื่อตรวจสอบการเข้าถึง
5. **ใช้ VPN หรือ private network** สำหรับการเชื่อมต่อใน production
