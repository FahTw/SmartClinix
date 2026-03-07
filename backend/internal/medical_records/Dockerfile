FROM golang:1.25-alpine AS builder

WORKDIR /app

# Cache dependencies first for faster rebuilds.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/medical-records-service ./main.go

FROM alpine:3.21

WORKDIR /app

# Useful runtime packages for TLS and time zone handling.
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /out/medical-records-service /app/medical-records-service

EXPOSE 8081
CMD ["/app/medical-records-service"]
