# FlowViz Docker Deployment Guide

Production-ready Docker setup for FlowViz attack flow analyzer.

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+ (optional but recommended)
- At least one API key (Anthropic or OpenAI)

### 1. Clone Repository

```bash
git clone https://github.com/Sarks0/flowviz.git
cd flowviz
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required:** Add at least one API key:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
# or
OPENAI_API_KEY=sk-your-key-here
```

### 3. Deploy with Docker Compose (Recommended)

```bash
docker-compose up -d
```

Access FlowViz at: **http://localhost:3001**

---

## Docker Compose Commands

### Start Services
```bash
docker-compose up -d              # Start in background
docker-compose up                 # Start with logs visible
```

### Stop Services
```bash
docker-compose down               # Stop and remove containers
docker-compose down -v            # Stop and remove volumes (deletes logs)
```

### View Logs
```bash
docker-compose logs -f            # Follow logs
docker-compose logs -f --tail=100 # Last 100 lines
```

### Restart
```bash
docker-compose restart            # Restart all services
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Health Check
```bash
docker-compose ps                 # View service status
curl http://localhost:3001/health # Test health endpoint
```

---

## Manual Docker Commands

### Build Image

```bash
docker build -t flowviz:latest .
```

### Run Container

```bash
docker run -d \
  --name flowviz \
  -p 3001:3001 \
  -e ANTHROPIC_API_KEY=sk-ant-your-key-here \
  -e NODE_ENV=production \
  -v flowviz-logs:/app/logs \
  --restart unless-stopped \
  flowviz:latest
```

### View Logs

```bash
docker logs -f flowviz            # Follow logs
docker logs --tail 100 flowviz    # Last 100 lines
```

### Execute Commands Inside Container

```bash
docker exec -it flowviz sh        # Open shell
docker exec -it flowviz node -v   # Check Node version
```

### Stop and Remove

```bash
docker stop flowviz
docker rm flowviz
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `OPENAI_API_KEY` | OpenAI API key (if using GPT) | `sk-...` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Server port |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-5-20250929` | Claude model |
| `OPENAI_MODEL` | `gpt-4o` | OpenAI model |
| `DEFAULT_AI_PROVIDER` | `anthropic` | Default provider |
| `ALLOWED_ORIGINS` | `http://localhost:3001` | CORS whitelist |
| `MAX_REQUEST_SIZE` | `10mb` | Max request body size |
| `MAX_ARTICLE_SIZE` | `5242880` | Max article size (5MB) |
| `MAX_IMAGE_SIZE` | `3145728` | Max image size (3MB) |
| `RATE_LIMIT_ARTICLES` | `10` | Articles per 15min |
| `RATE_LIMIT_IMAGES` | `50` | Images per 10min |
| `RATE_LIMIT_STREAMING` | `5` | Streams per 5min |
| `LOG_LEVEL` | `info` | Logging level |

---

## Production Deployment

### 1. Ubuntu Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group (optional, for non-root access)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Deploy FlowViz

```bash
# Clone repository
git clone https://github.com/Sarks0/flowviz.git
cd flowviz

# Create .env file with your API keys
nano .env

# Deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 3. Configure Firewall

```bash
# Allow port 3001
sudo ufw allow 3001/tcp
sudo ufw reload

# Or allow only from specific IP
sudo ufw allow from YOUR_IP to any port 3001
```

### 4. Set Up Reverse Proxy (Nginx)

```bash
sudo apt install nginx -y

sudo nano /etc/nginx/sites-available/flowviz
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for long-running requests
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

**Enable and test:**
```bash
sudo ln -s /etc/nginx/sites-available/flowviz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Enable SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Docker Image Details

### Image Specifications

- **Base Image:** `node:20-alpine` (minimal size)
- **Multi-stage build:** Separate frontend build and runtime
- **Size:** ~400MB compressed
- **User:** Non-root (`nodejs:1001`)
- **Init System:** `dumb-init` for proper signal handling
- **Health Check:** HTTP endpoint every 30s

### Security Features

- ✅ Non-root user execution
- ✅ Minimal attack surface (Alpine Linux)
- ✅ No new privileges flag
- ✅ Health checks enabled
- ✅ Proper signal handling
- ✅ Production dependencies only

### Volumes

- `/app/logs` - Application logs (persisted in `flowviz-logs` volume)

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs flowviz
```

**Common issues:**
- Missing API keys in `.env`
- Port 3001 already in use
- Insufficient permissions

**Solutions:**
```bash
# Check if port is in use
sudo netstat -tulpn | grep :3001

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:3001)

# Verify .env file exists
cat .env

# Check container status
docker-compose ps
docker inspect flowviz
```

### Health Check Failing

```bash
# Check health status
docker inspect --format='{{json .State.Health}}' flowviz | jq

# Test health endpoint manually
docker exec flowviz wget -qO- http://localhost:3001/health

# Or from host
curl http://localhost:3001/health
```

### High Memory Usage

```bash
# Check resource usage
docker stats flowviz

# Adjust limits in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G  # Reduce from 2G
```

### API Key Issues

```bash
# Verify environment variables are loaded
docker exec flowviz env | grep API_KEY

# Update API key without rebuild
docker-compose down
nano .env  # Update key
docker-compose up -d
```

### Logs Not Persisting

```bash
# Check volume exists
docker volume ls | grep flowviz

# Inspect volume
docker volume inspect flowviz-logs

# Access logs
docker exec flowviz ls -la logs/
docker exec flowviz cat logs/combined.log
```

### Rebuild Without Cache

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Remove Everything and Start Fresh

```bash
docker-compose down -v  # Remove volumes
docker system prune -a  # Clean all unused images
docker-compose up -d --build
```

---

## Monitoring

### View Real-time Logs

```bash
docker-compose logs -f --tail=50
```

### Monitor Resource Usage

```bash
# Real-time stats
docker stats flowviz

# One-time check
docker stats flowviz --no-stream
```

### Check Container Health

```bash
# Health status
docker inspect flowviz | grep -A 5 Health

# Or use docker-compose
docker-compose ps
```

---

## Backup and Restore

### Backup Logs

```bash
# Create backup directory
mkdir -p backups

# Copy logs from volume
docker run --rm -v flowviz-logs:/data -v $(pwd)/backups:/backup alpine \
  tar czf /backup/flowviz-logs-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Logs

```bash
# Extract backup to volume
docker run --rm -v flowviz-logs:/data -v $(pwd)/backups:/backup alpine \
  tar xzf /backup/flowviz-logs-YYYYMMDD.tar.gz -C /data
```

---

## Updating FlowViz

### Update to Latest Version

```bash
cd flowviz

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose logs -f
```

---

## Advanced Configuration

### Custom Port

**Edit docker-compose.yml:**
```yaml
ports:
  - "8080:3001"  # Access on port 8080
```

### Multiple Instances

**docker-compose.override.yml:**
```yaml
version: '3.8'
services:
  flowviz:
    ports:
      - "3002:3001"
    container_name: flowviz-app-2
```

Run: `docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d`

### Behind Corporate Proxy

Add to `Dockerfile` before `RUN npm` commands:
```dockerfile
ENV HTTP_PROXY=http://proxy.company.com:8080
ENV HTTPS_PROXY=http://proxy.company.com:8080
```

---

## Performance Optimization

### Reduce Image Size

Already optimized with:
- Multi-stage builds
- Alpine Linux base
- Production dependencies only
- Minimal layers

### Improve Startup Time

- Use cached layers (don't use `--no-cache` unless needed)
- Pre-pull base image: `docker pull node:20-alpine`

### Optimize Memory

Adjust in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

---

## Support

### Useful Commands Reference

```bash
# Quick health check
curl http://localhost:3001/health

# View all containers
docker ps -a

# View all images
docker images

# Clean unused resources
docker system prune -a

# Export container logs to file
docker-compose logs > flowviz-logs.txt

# Check Docker disk usage
docker system df
```

### Common Errors

| Error | Solution |
|-------|----------|
| Port already in use | Change port or kill existing process |
| API key not found | Check `.env` file exists and is correct |
| Health check failing | Check logs, verify API connectivity |
| Out of memory | Reduce memory limits or increase server RAM |
| Build fails | Clear cache with `--no-cache` |

---

## License

FlowViz Docker configuration - Production deployment setup
Maintained by: Sarks0
