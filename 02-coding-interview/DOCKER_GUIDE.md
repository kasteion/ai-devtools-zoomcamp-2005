# Docker Deployment Guide

This guide explains how to build and run the Online Coding Interview Platform using Docker.

## Overview

The application is containerized in a single Docker image that includes:

- ✅ Built frontend (React + Vite)
- ✅ Backend server (Express.js + Socket.IO)
- ✅ Static file serving
- ✅ WebSocket support

## Architecture

```
┌─────────────────────────────────────┐
│         Docker Container            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Node.js Backend Server     │  │
│  │   (Express + Socket.IO)      │  │
│  │                              │  │
│  │   Serves:                    │  │
│  │   - REST API (/api/*)        │  │
│  │   - WebSocket (Socket.IO)    │  │
│  │   - Static Files (Frontend)  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Built Frontend Files       │  │
│  │   (Static HTML/CSS/JS)       │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         Port 3001 → Host
```

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Access the application at: **http://localhost:3001**

### Using Docker CLI

```bash
# Build the image
docker build -t coding-interview-app .

# Run the container
docker run -d \
  -p 3001:3001 \
  --name coding-interview \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=* \
  coding-interview-app

# View logs
docker logs -f coding-interview

# Stop the container
docker stop coding-interview
docker rm coding-interview
```

## Dockerfile Explanation

### Multi-Stage Build

The [`Dockerfile`](Dockerfile:1) uses a multi-stage build for optimization:

**Stage 1: Frontend Builder**

```dockerfile
FROM node:18-alpine AS frontend-builder
# Builds the React frontend
# Output: /app/frontend/dist
```

**Stage 2: Production Server**

```dockerfile
FROM node:18-alpine
# Copies backend code
# Copies built frontend from Stage 1
# Serves everything from one Node.js process
```

### Key Features

1. **Small Image Size**: Uses Alpine Linux (~50MB base)
2. **Production Dependencies Only**: `npm ci --only=production`
3. **Multi-stage Build**: Discards build tools in final image
4. **Signal Handling**: Uses dumb-init for proper process management
5. **Static File Serving**: Backend serves built frontend files

## Environment Variables

### Required Variables

```bash
PORT=3001                    # Server port
NODE_ENV=production          # Environment
CORS_ORIGIN=*               # CORS configuration
SESSION_TIMEOUT=1800000     # 30 minutes
MAX_SESSION_DURATION=14400000  # 4 hours
BASE_URL=http://localhost:3001  # Base URL for share links
```

### Setting Variables

**Docker Compose:**
Edit [`docker-compose.yml`](docker-compose.yml:1)

**Docker CLI:**

```bash
docker run -d \
  -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=* \
  coding-interview-app
```

## Building the Image

### Standard Build

```bash
docker build -t coding-interview-app .
```

### Build with Custom Tag

```bash
docker build -t coding-interview-app:v1.0.0 .
```

### Build with No Cache

```bash
docker build --no-cache -t coding-interview-app .
```

### View Build Logs

```bash
docker build -t coding-interview-app . --progress=plain
```

## Running the Container

### Basic Run

```bash
docker run -d -p 3001:3001 coding-interview-app
```

### Run with Custom Port

```bash
docker run -d -p 8080:3001 coding-interview-app
```

Access at: http://localhost:8080

### Run with Environment File

Create `.env.docker`:

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
SESSION_TIMEOUT=1800000
```

Run:

```bash
docker run -d -p 3001:3001 --env-file .env.docker coding-interview-app
```

### Run with Volume (for logs)

```bash
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/logs:/app/logs \
  coding-interview-app
```

## Container Management

### View Running Containers

```bash
docker ps
```

### View All Containers

```bash
docker ps -a
```

### View Logs

```bash
# Follow logs
docker logs -f coding-interview

# Last 100 lines
docker logs --tail 100 coding-interview

# Logs since 10 minutes ago
docker logs --since 10m coding-interview
```

### Execute Commands in Container

```bash
# Open shell
docker exec -it coding-interview sh

# Check Node.js version
docker exec coding-interview node --version

# View environment variables
docker exec coding-interview env
```

### Stop and Remove

```bash
# Stop container
docker stop coding-interview

# Remove container
docker rm coding-interview

# Stop and remove in one command
docker rm -f coding-interview
```

## Health Checks

The container includes a health check that verifies the server is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' coding-interview

# View health check logs
docker inspect --format='{{json .State.Health}}' coding-interview | jq
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs coding-interview

# Check if port is already in use
lsof -i :3001

# Try different port
docker run -d -p 8080:3001 coding-interview-app
```

### Build Fails

```bash
# Clean Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t coding-interview-app .

# Check disk space
docker system df
```

### Container Crashes

```bash
# View exit code
docker ps -a | grep coding-interview

# View last logs before crash
docker logs --tail 50 coding-interview

# Inspect container
docker inspect coding-interview
```

### WebSocket Connection Issues

1. Ensure CORS_ORIGIN is set correctly
2. Check firewall allows port 3001
3. Verify WebSocket upgrade headers are allowed
4. Check browser console for errors

## Production Deployment

### Cloud Platforms

**AWS ECS:**

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag coding-interview-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/coding-interview-app:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/coding-interview-app:latest
```

**Google Cloud Run:**

```bash
# Build and push
gcloud builds submit --tag gcr.io/<project-id>/coding-interview-app

# Deploy
gcloud run deploy coding-interview-app \
  --image gcr.io/<project-id>/coding-interview-app \
  --platform managed \
  --port 3001
```

**Railway.app:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Configuration for Production

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
SESSION_TIMEOUT=1800000
MAX_SESSION_DURATION=14400000
BASE_URL=https://your-domain.com
```

### HTTPS Configuration

For production, use a reverse proxy (nginx, Caddy) or cloud load balancer:

**nginx example:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Image Optimization

### Current Image Size

```bash
# Check image size
docker images coding-interview-app
```

Expected size: ~200-300MB

### Optimization Tips

1. **Use Alpine Linux**: Already implemented ✅
2. **Multi-stage Build**: Already implemented ✅
3. **Production Dependencies Only**: Already implemented ✅
4. **Minimize Layers**: Combine RUN commands where possible

### Further Optimization

```dockerfile
# Add to Dockerfile for smaller image
RUN npm prune --production
RUN rm -rf /root/.npm
```

## Monitoring

### Container Stats

```bash
# Real-time stats
docker stats coding-interview

# One-time stats
docker stats --no-stream coding-interview
```

### Resource Limits

```bash
# Limit memory to 512MB
docker run -d \
  -p 3001:3001 \
  --memory="512m" \
  --cpus="1.0" \
  coding-interview-app
```

### Docker Compose with Limits

```yaml
services:
  app:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

## Backup and Restore

### Export Container

```bash
# Save image to tar
docker save coding-interview-app > coding-interview-app.tar

# Load image from tar
docker load < coding-interview-app.tar
```

### Export Container State

```bash
# Commit running container to image
docker commit coding-interview coding-interview-app:backup

# Export to tar
docker save coding-interview-app:backup > backup.tar
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build -t coding-interview-app .

      - name: Run tests
        run: |
          docker run -d -p 3001:3001 --name test-container coding-interview-app
          sleep 10
          curl http://localhost:3001/api/health
          docker stop test-container

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag coding-interview-app ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/coding-interview-app:latest
```

## Security Best Practices

1. **Don't run as root**: Add USER directive (optional enhancement)
2. **Scan for vulnerabilities**: Use `docker scan coding-interview-app`
3. **Keep base image updated**: Regularly rebuild with latest node:18-alpine
4. **Use secrets**: Don't hardcode sensitive data
5. **Limit network exposure**: Only expose necessary ports

## Performance Tuning

### Build Performance

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t coding-interview-app .
```

### Runtime Performance

```bash
# Use host network for better performance (Linux only)
docker run -d --network host coding-interview-app
```

## Cleanup

### Remove Unused Images

```bash
# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### Clean Everything

```bash
# Remove all stopped containers, unused networks, dangling images
docker system prune

# Remove everything including volumes
docker system prune -a --volumes
```

## Quick Reference

### Common Commands

```bash
# Build
docker build -t coding-interview-app .

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Shell access
docker exec -it coding-interview sh

# Health check
curl http://localhost:3001/api/health
```

### Useful Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose up -d --build'
```

## Support

For Docker-related issues:

1. Check container logs: `docker logs coding-interview`
2. Verify port availability: `lsof -i :3001`
3. Check Docker daemon: `docker info`
4. Review build logs: `docker build --progress=plain`

---

**Docker Version Tested**: 20.10+
**Docker Compose Version**: 2.0+
