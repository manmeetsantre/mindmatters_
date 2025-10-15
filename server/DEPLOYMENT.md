# MAITRI Space Station Crew Mental Health Monitoring System
## Deployment Guide

This guide provides comprehensive instructions for deploying the MAITRI space station crew mental health monitoring system in various environments.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- SQLite 3
- 4GB+ RAM
- 10GB+ storage

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd MindMatters/server

# Run the installation script
chmod +x install-ai-ml.sh
./install-ai-ml.sh

# Start the system
./start-maitri.sh
```

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4GB
- **Storage**: 10GB SSD
- **OS**: Linux (Ubuntu 20.04+), Windows 10+, macOS 10.15+
- **Network**: Ethernet connection (for initial setup)

### Recommended Requirements
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Linux (Ubuntu 22.04 LTS)
- **Network**: Gigabit Ethernet
- **GPU**: NVIDIA GPU with CUDA support (for AI model acceleration)

### Space Station Requirements
- **CPU**: 8 cores, 3.5 GHz
- **RAM**: 16GB
- **Storage**: 100GB SSD
- **OS**: Linux (Ubuntu 22.04 LTS)
- **Network**: Redundant Ethernet connections
- **GPU**: NVIDIA RTX 4090 or equivalent
- **Redundancy**: Dual power supplies, RAID storage

## 🐳 Docker Deployment

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  maitri-api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_PATH=/app/data.sqlite
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./uploads:/app/uploads
    depends_on:
      - maitri-ai

  maitri-ai:
    build: .
    command: python3 src/standalone/offline-system.py start 1
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./uploads:/app/uploads
    environment:
      - PYTHONPATH=/app/src

  maitri-monitoring:
    build: .
    command: python3 src/ai/emotion-detector.py
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./uploads:/app/uploads
    environment:
      - PYTHONPATH=/app/src
```

### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip python3-dev

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    cmake \
    pkgconfig \
    libffi-dev \
    openssl-dev \
    libsndfile-dev \
    libasound2-dev \
    portaudio19-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create necessary directories
RUN mkdir -p data models uploads alerts logs

# Set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
```

### Deployment Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull
docker-compose up -d
```

## ☁️ Cloud Deployment

### AWS Deployment

#### EC2 Instance Setup
```bash
# Launch EC2 instance (t3.large or larger)
# Ubuntu 22.04 LTS AMI
# Security group: HTTP (80), HTTPS (443), SSH (22)

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install dependencies
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip sqlite3

# Clone and setup
git clone <repository-url>
cd MindMatters/server
chmod +x install-ai-ml.sh
./install-ai-ml.sh
```

#### RDS Database Setup
```bash
# Create RDS PostgreSQL instance
# Engine: PostgreSQL 14
# Instance class: db.t3.micro
# Storage: 20GB
# Security group: Allow access from EC2

# Update database configuration
export DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/maitri"
```

#### Load Balancer Setup
```bash
# Create Application Load Balancer
# Target group: EC2 instances
# Health check: /health endpoint
# SSL certificate: ACM certificate
```

### Azure Deployment

#### Azure Container Instances
```bash
# Create resource group
az group create --name maitri-rg --location eastus

# Create container instance
az container create \
  --resource-group maitri-rg \
  --name maitri-ai \
  --image your-registry/maitri-ai:latest \
  --cpu 2 \
  --memory 4 \
  --ports 4000 \
  --environment-variables \
    NODE_ENV=production \
    PORT=4000
```

#### Azure Database for PostgreSQL
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group maitri-rg \
  --name maitri-db \
  --admin-user maitriadmin \
  --admin-password YourPassword123! \
  --sku-name GP_Gen5_2
```

### Google Cloud Deployment

#### Cloud Run
```bash
# Build and push image
gcloud builds submit --tag gcr.io/your-project/maitri-ai

# Deploy to Cloud Run
gcloud run deploy maitri-ai \
  --image gcr.io/your-project/maitri-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Cloud SQL
```bash
# Create Cloud SQL instance
gcloud sql instances create maitri-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

## 🏗️ On-Premises Deployment

### Physical Server Setup
```bash
# Install Ubuntu 22.04 LTS
# Configure network settings
# Set up RAID storage
# Install security updates

# Install dependencies
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip sqlite3

# Clone repository
git clone <repository-url>
cd MindMatters/server

# Run installation
chmod +x install-ai-ml.sh
./install-ai-ml.sh

# Configure systemd service
sudo systemctl enable maitri-ai
sudo systemctl start maitri-ai
```

### Network Configuration
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Configure reverse proxy (Nginx)
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/maitri
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🚀 Space Station Deployment

### Hardware Requirements
- **Primary Server**: Dell PowerEdge R750 or equivalent
- **Backup Server**: Dell PowerEdge R750 or equivalent
- **Storage**: 2x 1TB NVMe SSDs in RAID 1
- **Network**: Redundant Ethernet connections
- **Power**: Dual power supplies with UPS
- **Cooling**: Redundant cooling systems

### Installation Process
```bash
# 1. Install base system
# Ubuntu 22.04 LTS with security updates
# Configure network interfaces
# Set up RAID storage

# 2. Install dependencies
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip sqlite3

# 3. Clone and setup
git clone <repository-url>
cd MindMatters/server
chmod +x install-ai-ml.sh
./install-ai-ml.sh

# 4. Configure redundancy
sudo systemctl enable maitri-ai
sudo systemctl start maitri-ai

# 5. Set up monitoring
sudo systemctl enable maitri-monitoring
sudo systemctl start maitri-monitoring
```

### Redundancy Configuration
```bash
# Configure automatic failover
# Set up database replication
# Configure backup systems
# Test failover procedures
```

## 🔧 Configuration

### Environment Variables
```bash
# Server configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database configuration
DATABASE_PATH=./data.sqlite
DATABASE_URL=postgresql://user:pass@host:5432/maitri

# AI/ML configuration
MODELS_PATH=./models
UPLOADS_PATH=./uploads
ALERTS_PATH=./alerts

# Monitoring configuration
MONITORING_INTERVAL=60
ALERT_THRESHOLD=0.8
OFFLINE_MODE=true

# Crew configuration
MAX_CONCURRENT_MONITORING=10
ANALYSIS_INTERVAL=300
RETENTION_HOURS=24
```

### Configuration File
```json
{
  "server": {
    "port": 4000,
    "host": "0.0.0.0",
    "environment": "production"
  },
  "database": {
    "path": "./data.sqlite",
    "backup_interval": 3600,
    "retention_days": 30
  },
  "ai": {
    "models_path": "./models",
    "confidence_threshold": 0.7,
    "critical_thresholds": {
      "stress": 0.7,
      "depression": 0.6,
      "anxiety": 0.8,
      "isolation": 0.5
    }
  },
  "monitoring": {
    "check_interval": 60,
    "alert_threshold": 0.8,
    "offline_mode": true
  },
  "crew": {
    "max_concurrent_monitoring": 10,
    "analysis_interval": 300,
    "retention_hours": 24
  }
}
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check system health
./health-check.sh

# Check service status
sudo systemctl status maitri-ai
sudo systemctl status maitri-monitoring

# Check database
sqlite3 data.sqlite "SELECT COUNT(*) FROM crew_members;"

# Check logs
tail -f logs/maitri-ai.log
tail -f logs/emotion-detector.log
```

### Backup Procedures
```bash
# Database backup
sqlite3 data.sqlite ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# Model backup
tar -czf models_backup_$(date +%Y%m%d_%H%M%S).tar.gz models/

# Full system backup
tar -czf maitri_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  data.sqlite models/ uploads/ alerts/ logs/
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/maitri-ai

# Logrotate configuration
/var/log/maitri-ai/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 maitri maitri
    postrotate
        systemctl reload maitri-ai
    endscript
}
```

## 🔒 Security

### Access Control
```bash
# Create dedicated user
sudo useradd -r -s /bin/false maitri
sudo chown -R maitri:maitri /opt/maitri

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Configure SSL/TLS
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Data Encryption
```bash
# Encrypt sensitive data
openssl enc -aes-256-cbc -salt -in data.sqlite -out data.sqlite.enc

# Decrypt when needed
openssl enc -aes-256-cbc -d -in data.sqlite.enc -out data.sqlite
```

### Network Security
```bash
# Configure VPN access
sudo apt install openvpn
sudo systemctl enable openvpn@server
sudo systemctl start openvpn@server

# Configure intrusion detection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
sudo journalctl -u maitri-ai -f

# Check configuration
./health-check.sh

# Restart service
sudo systemctl restart maitri-ai
```

#### Database Issues
```bash
# Check database integrity
sqlite3 data.sqlite "PRAGMA integrity_check;"

# Repair database
sqlite3 data.sqlite ".recover" | sqlite3 recovered.db
```

#### AI Model Issues
```bash
# Check model files
ls -la models/

# Test model loading
python3 -c "import tensorflow as tf; print(tf.__version__)"

# Reinstall models
./install-ai-ml.sh
```

### Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check service performance
sudo systemctl status maitri-ai
sudo systemctl status maitri-monitoring
```

## 📞 Support

### Documentation
- **API Documentation**: `/api-docs`
- **System Documentation**: `README-AI-ML.md`
- **Configuration Guide**: `config.json`

### Contact Information
- **Technical Support**: support@maitri.space
- **Emergency Support**: emergency@maitri.space
- **Documentation**: docs@maitri.space

### Emergency Procedures
1. **System Failure**: Switch to backup system
2. **Data Loss**: Restore from backup
3. **Security Breach**: Isolate system and contact security team
4. **Crew Emergency**: Activate emergency protocols

---

**MAITRI Space Station Crew Mental Health Monitoring System**
*Advanced AI-powered psychological support for space missions*
