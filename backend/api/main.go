package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"encoding/json"
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

// --- Response types ---
type HelloResponse struct {
	Message string `json:"message" doc:"A welcome message from the API"`
}

type HealthResponse struct {
	Status int `json:"status"`
}

type DeleteUserResponse struct {
	Deleted bool `json:"deleted"`
}

type UsersListResponse struct {
	Users  []*User `json:"users"`
	Status int     `json:"status"`
}

// --- User types ---
type User struct {
	ID     string `json:"id" doc:"User ID"`
	Name   string `json:"name" doc:"User's name"`
	Email  string `json:"email" doc:"User's email"`
	Status int    `json:"status,omitempty"`
}

type CreateUserRequest struct {
	Name  string `json:"name" doc:"User's name"`
	Email string `json:"email" doc:"User's email"`
}

type UpdateUserRequest struct {
	Name  *string `json:"name,omitempty" doc:"User's name"`
	Email *string `json:"email,omitempty" doc:"User's email"`
}

func main() {
	args := os.Args

	// --- Setup OpenAPI + router ---
	config := huma.DefaultConfig("Monorepo API", "1.0.0")
	router := chi.NewRouter()

	// --- CORS configuration ---
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:5175"}
	if corsOrigin != allowedOrigins[0] && corsOrigin != allowedOrigins[1] {
		allowedOrigins = append(allowedOrigins, corsOrigin)
	}
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	api := humachi.New(router, config)

	// --- In-memory store ---
	users := map[string]*User{}

	// --- Routes ---

	// Hello
	huma.Get(api, "/hello", func(ctx context.Context, input *struct{}) (*HelloResponse, error) {
		return &HelloResponse{Message: "Hello, world!"}, nil
	})

	// Health
	huma.Get(api, "/health", func(ctx context.Context, input *struct{}) (*HealthResponse, error) {
		return &HealthResponse{Status: 200}, nil
	})

	// Create User
	// @summary Create a new user
	// @description Create a new user with name and email.
	// @accept json
	// @produce json
	// @param user body CreateUserRequest true "User to create"
	// @success 201 {object} User "Created user"
	// @failure 400 {object} map[string]string "Invalid request"
	// @router /v1/users [post]
	router.Post("/v1/users", func(w http.ResponseWriter, r *http.Request) {
		var req CreateUserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		id := time.Now().Format("20060102150405")
		user := &User{
			ID:     id,
			Name:   req.Name,
			Email:  req.Email,
			Status: 201,
		}
		users[id] = user
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(201)
		_ = json.NewEncoder(w).Encode(user)
	})

	// @summary List all users
	// @description Get a list of all users.
	// @produce json
	// @success 200 {object} UsersListResponse "A list of users"
	// @router /v1/users [get]
	router.Get("/v1/users", func(w http.ResponseWriter, r *http.Request) {
		list := make([]*User, 0, len(users))
		for _, u := range users {
			list = append(list, u)
		}
		log.Printf("GET /v1/users called, returning %d users", len(list))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		_ = json.NewEncoder(w).Encode(&UsersListResponse{Users: list, Status: 200})
	})

	// @summary Get user by ID
	// @description Get a user by their ID.
	// @produce json
	// @param id path string true "User ID"
	// @success 200 {object} User "User found"
	// @failure 404 {object} map[string]string "User not found"
	// @router /v1/users/{id} [get]
	router.Get("/v1/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		user, ok := users[id]
		w.Header().Set("Content-Type", "application/json")
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}
		w.WriteHeader(200)
		_ = json.NewEncoder(w).Encode(user)
	})

	// @summary Update user by ID
	// @description Update a user's name and/or email by their ID.
	// @accept json
	// @produce json
	// @param id path string true "User ID"
	// @param user body UpdateUserRequest true "User fields to update"
	// @success 200 {object} User "User updated"
	// @failure 400 {object} map[string]string "Invalid request"
	// @failure 404 {object} map[string]string "User not found"
	// @router /v1/users/{id} [put]
	router.Put("/v1/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		var req UpdateUserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		user, ok := users[id]
		w.Header().Set("Content-Type", "application/json")
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
			return
		}
		if req.Name != nil {
			user.Name = *req.Name
		}
		if req.Email != nil {
			user.Email = *req.Email
		}
		w.WriteHeader(200)
		_ = json.NewEncoder(w).Encode(user)
	})

	// @summary Delete user by ID
	// @description Delete a user by their ID.
	// @produce json
	// @param id path string true "User ID"
	// @success 200 {object} DeleteUserResponse "User deleted"
	// @failure 404 {object} DeleteUserResponse "User not found"
	// @router /v1/users/{id} [delete]
	router.Delete("/v1/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, ok := users[id]
		w.Header().Set("Content-Type", "application/json")
		if !ok {
			w.WriteHeader(404)
			_ = json.NewEncoder(w).Encode(&DeleteUserResponse{Deleted: false})
			return
		}
		delete(users, id)
		w.WriteHeader(200)
		_ = json.NewEncoder(w).Encode(&DeleteUserResponse{Deleted: true})
	})

	// --- OpenAPI Spec ---
	spec := api.OpenAPI()
	openapiPath := os.Getenv("OPENAPI_PATH")
	if openapiPath == "" {
		openapiPath = "packages/api/src/contracts/v1.json"
	}
	if err := os.MkdirAll("packages/api/src/contracts", 0755); err != nil {
		log.Fatalf("Failed to create contracts directory: %v", err)
	}
	b, err := spec.MarshalJSON()
	if err != nil {
		log.Fatalf("Failed to marshal OpenAPI JSON: %v", err)
	}
	if err := os.WriteFile(openapiPath, b, 0644); err != nil {
		log.Fatalf("Failed to write OpenAPI JSON: %v", err)
	}
	log.Printf("OpenAPI spec written to %s\n", openapiPath)

	if len(args) > 1 && args[1] == "gen:openapi" {
		return
	}

	// --- HTTP Server ---
	port := os.Getenv("API_PORT")
	if port == "" {
		port = "8080"
	}
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
		<-c
		log.Println("Graceful shutdown...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	log.Printf("Server running on http://0.0.0.0:%s\n", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}
