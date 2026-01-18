FROM golang:alpine

WORKDIR /app

# Set Go proxy to include direct fallback
ENV GOPROXY=https://proxy.golang.org,direct

# Copy go mod files
COPY api/go.mod api/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY api/ .

# Build the application
RUN go build -o main .

# Expose port
EXPOSE 8080

# Run the app
CMD ["./main"]
