.PHONY: run build tidy vet test db-up db-down migrate

run:        ## Run the API server (in-memory store, serves ../frontend/dist if built)
	go run ./cmd/server

build:      ## Compile the server binary
	go build -o bin/server ./cmd/server

tidy:
	go mod tidy

vet:
	go vet ./...

test:
	go test ./...

db-up:      ## Start the Postgres data tier
	docker compose up -d

db-down:
	docker compose down

# Requires golang-migrate: https://github.com/golang-migrate/migrate
DATABASE_URL ?= postgres://k8s:k8s@localhost:5432/k8s_platform?sslmode=disable
migrate:    ## Apply DB migrations
	migrate -path internal/db/migrations -database "$(DATABASE_URL)" up
