# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Baixa as dependências primeiro para aproveitar o cache
COPY go.mod go.sum ./
RUN go mod tidy
RUN go mod download

# Copia o resto do código-fonte
COPY . .

# Build
# -o main: nome do binário final
# -ldflags "-s -w": remove símbolos de debug, diminuindo o tamanho
RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags "-s -w" -o main .

# Stage 2: Final image
FROM alpine:latest

WORKDIR /root/

# Copia apenas o binário compilado do stage 'builder'
COPY --from=builder /app/main .

# (Opcional: Se você NÃO usar variáveis de ambiente, copie o .env)
# COPY .env .

# Expõe a porta que o Gin vai usar
EXPOSE 8080

# Comando para rodar
CMD ["./main"]