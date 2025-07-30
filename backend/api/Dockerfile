# --- Build stage ---
FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY . .

# Download dependencies
RUN go mod download

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o backend-api .

# --- Run stage ---
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/backend-api .
# Optionally copy static files or migrations if needed

# Create non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

ENV API_PORT=8080

CMD ["./backend-api"]
