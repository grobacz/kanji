# Docker Setup for Kanji Trainer

This document explains how to run the Kanji Trainer application using Docker.

## Quick Start

### Production Build

```bash
# Build and run the production container
docker-compose up -d

# Access the application at http://localhost:3000
```

### Development Build

```bash
# Run the development container with hot reload
docker-compose --profile dev up -d kanji-trainer-dev

# Access the development server at http://localhost:5173
```

## Manual Docker Commands

### Production

```bash
# Build the production image
docker build -t kanji-trainer .

# Run the production container
docker run -d -p 3000:80 --name kanji-trainer kanji-trainer

# Check health status
docker ps
```

### Development

```bash
# Build the development image
docker build -f Dockerfile.dev -t kanji-trainer-dev .

# Run the development container
docker run -d -p 5173:5173 -v $(pwd):/app -v /app/node_modules --name kanji-trainer-dev kanji-trainer-dev
```

## Container Features

### Production Container
- Multi-stage build for optimized image size
- Nginx web server for static file serving
- Gzip compression enabled
- Security headers configured
- Health checks included
- Non-root user for security

### Development Container
- Hot reload support
- Volume mounting for live code changes
- All development dependencies included
- Health checks for development server

## Health Checks

Both containers include health checks:

- **Production**: `http://localhost:3000/health`
- **Development**: `http://localhost:5173/`

## Container Management

```bash
# View running containers
docker ps

# View logs
docker logs kanji-trainer

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build

# Clean up
docker system prune -a
```

## Environment Variables

The containers support the following environment variables:

- `NODE_ENV`: Set to "production" or "development"

## Troubleshooting

### Build Issues
- Ensure Docker daemon is running
- Check that ports 3000 (production) or 5173 (development) are available
- Verify all source files are present

### Runtime Issues
- Check container logs: `docker logs kanji-trainer`
- Verify health check status: `docker ps`
- Ensure sufficient system resources

### Performance
- The production container uses Nginx for optimal static file serving
- Gzip compression is enabled for better performance
- Static assets are cached with appropriate headers