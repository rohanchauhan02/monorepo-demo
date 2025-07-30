# --- Backend build stage ---
FROM golang:1.23-alpine AS backend-build

WORKDIR /app
COPY backend/api ./backend/api
COPY go.mod go.sum ./
RUN go mod download
RUN cd backend/api && go build -o /app/backend-api

# --- Frontend build stage ---
FROM node:18-alpine AS frontend-build

WORKDIR /app
COPY apps/dashboard ./apps/dashboard
RUN cd apps/dashboard && npm install && npm run build

# --- Final stage ---
FROM alpine:latest

# Backend
COPY --from=backend-build /app/backend-api /app/backend-api

# Frontend
COPY --from=frontend-build /app/apps/dashboard/dist /app/frontend

# Install serve for static frontend
RUN apk add --no-cache nodejs npm && npm install -g serve

# Create non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

EXPOSE 8080
EXPOSE 5175

# Start both backend and frontend using a simple shell script
CMD sh -c "./backend-api & serve -s /app/frontend -l 5175 && wait"
