# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git for dependencies
RUN apk add --no-cache git

# Copy go mod files from the api directory (context is repository root)
COPY api/go.mod api/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code from the api directory
COPY api/ .

# Build the application
# Use the correct path to main.go and ensure no vendoring issues
RUN go build -mod=readonly -o main ./cmd/server/main.go

# Production stage
FROM alpine:latest

WORKDIR /app

# Add certificates for HTTPS requests
RUN apk add --no-cache ca-certificates

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Run the app
CMD ["./main"]
