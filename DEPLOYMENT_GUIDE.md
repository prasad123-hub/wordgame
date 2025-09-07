# AWS EC2 Deployment Guide

This guide will walk you through deploying your Word Game application on AWS EC2 using Docker, MongoDB Atlas, and GitHub Actions with a self-hosted runner.

## Prerequisites

- AWS Account
- MongoDB Atlas account with a cluster set up
- GitHub repository with your code
- Basic knowledge of AWS EC2, Docker, and GitHub Actions

## Step-by-Step Deployment Plan

### Phase 1: AWS EC2 Setup

#### 1.1 Launch EC2 Instance
1. **Log into AWS Console** and navigate to EC2
2. **Launch Instance** with the following specifications:
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: t2.micro (Free tier) or t3.small (recommended for production)
   - **Key Pair**: Create or select an existing key pair for SSH access
   - **Security Group**: Create a new security group with these rules:
     - SSH (22) - Your IP
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0
     - Custom TCP (8000) - 0.0.0.0/0 (for your app)
   - **Storage**: 8GB minimum (20GB recommended)

#### 1.2 Connect to EC2 Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 1.3 Update System and Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Install Node.js (for GitHub Actions runner)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt install curl wget unzip -y

# Reboot to apply Docker group changes
sudo reboot
```

### Phase 2: MongoDB Atlas Setup

#### 2.1 Configure MongoDB Atlas
1. **Log into MongoDB Atlas** console
2. **Create a new cluster** if you haven't already
3. **Set up database access**:
   - Go to Database Access
   - Add a new database user with read/write permissions
   - Note down the username and password
4. **Configure network access**:
   - Go to Network Access
   - Add IP address: `0.0.0.0/0` (for EC2 access) or your EC2's public IP
5. **Get connection string**:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string (replace `<password>` with your actual password)

#### 2.2 Test MongoDB Connection
```bash
# Test connection from EC2 (optional)
curl -s "https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1" \
  -H "apiKey: your-api-key" \
  -H "Content-Type: application/json"
```

### Phase 3: GitHub Actions Self-Hosted Runner Setup

#### 3.1 Create GitHub Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Copy and save the token securely

#### 3.2 Set Up Self-Hosted Runner on EC2
```bash
# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure the runner (replace with your values)
./config.sh --url https://github.com/your-username/your-repo --token YOUR_RUNNER_TOKEN

# Install the runner as a service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

#### 3.3 Configure GitHub Repository Secrets
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your frontend domain (or `*` for development)
   - `LOG_LEVEL`: `info` (optional)

### Phase 4: Application Deployment

#### 4.1 Clone Repository on EC2
```bash
# Clone your repository
git clone https://github.com/your-username/wordgame.git
cd wordgame

# Make sure you're on the main branch
git checkout main
```

#### 4.2 Test Local Deployment
```bash
# Navigate to server directory
cd server

# Create environment file
cat > .env << EOF
MONGODB_URI=your-mongodb-atlas-connection-string
NODE_ENV=production
PORT=8000
CORS_ORIGIN=*
LOG_LEVEL=info
EOF

# Test the deployment
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Check if it's running
sudo docker-compose -f docker-compose.prod.yml ps

# Check logs
sudo docker-compose -f docker-compose.prod.yml logs -f

# Test the application
curl http://localhost:8000

# Stop the test deployment
sudo docker-compose -f docker-compose.prod.yml down
```

### Phase 5: Production Deployment

#### 5.1 Set Up Nginx (Optional but Recommended)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/wordgame

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com your-ec2-public-ip;

    location / {
        proxy_pass http://localhost:8000;
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

# Enable the site
sudo ln -s /etc/nginx/sites-available/wordgame /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5.2 Set Up SSL with Let's Encrypt (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Phase 6: GitHub Actions Deployment

#### 6.1 Trigger Deployment
1. **Push changes** to your main branch
2. **Check GitHub Actions** tab in your repository
3. **Monitor the workflow** execution
4. **Verify deployment** by accessing your application

#### 6.2 Monitor and Troubleshoot
```bash
# Check application status
sudo docker-compose -f docker-compose.prod.yml ps

# View application logs
sudo docker-compose -f docker-compose.prod.yml logs -f app

# Check system resources
htop
df -h
free -h

# Restart application if needed
sudo docker-compose -f docker-compose.prod.yml restart
```

## Maintenance and Updates

### Regular Maintenance Tasks
1. **Update system packages**: `sudo apt update && sudo apt upgrade -y`
2. **Update Docker images**: `sudo docker-compose -f docker-compose.prod.yml pull`
3. **Clean up unused Docker resources**: `sudo docker system prune -a`
4. **Monitor logs**: `sudo docker-compose -f docker-compose.prod.yml logs -f`

### Backup Strategy
1. **Database**: MongoDB Atlas provides automatic backups
2. **Application**: Your code is in Git, so it's already backed up
3. **Configuration**: Keep your `.env` file backed up securely

### Scaling Considerations
1. **Vertical scaling**: Upgrade EC2 instance type
2. **Horizontal scaling**: Use Application Load Balancer with multiple EC2 instances
3. **Database scaling**: MongoDB Atlas handles this automatically

## Troubleshooting Common Issues

### Application Won't Start
```bash
# Check logs
sudo docker-compose -f docker-compose.prod.yml logs app

# Check environment variables
sudo docker-compose -f docker-compose.prod.yml config

# Test MongoDB connection
sudo docker-compose -f docker-compose.prod.yml exec app node -e "console.log(process.env.MONGODB_URI)"
```

### Port Already in Use
```bash
# Check what's using port 8000
sudo netstat -tulpn | grep :8000

# Kill the process
sudo kill -9 PID
```

### GitHub Actions Runner Issues
```bash
# Check runner status
sudo ./svc.sh status

# Restart runner
sudo ./svc.sh restart

# Check runner logs
sudo journalctl -u actions.runner.* -f
```

## Security Considerations

1. **Firewall**: Only open necessary ports
2. **SSH**: Use key-based authentication only
3. **Updates**: Keep system and Docker images updated
4. **Secrets**: Never commit `.env` files to Git
5. **HTTPS**: Use SSL certificates for production
6. **Database**: Use MongoDB Atlas IP whitelisting

## Cost Optimization

1. **Instance type**: Start with t2.micro, scale as needed
2. **Storage**: Use appropriate EBS volume size
3. **Monitoring**: Set up CloudWatch alarms for costs
4. **Auto-scaling**: Implement if traffic patterns are predictable

## Next Steps

1. **Set up monitoring** with CloudWatch or similar
2. **Implement CI/CD** for automated testing
3. **Add health checks** and alerting
4. **Set up log aggregation** with ELK stack or similar
5. **Implement blue-green deployments** for zero-downtime updates

---

**Note**: This guide assumes you're using the provided `docker-compose.prod.yml` file and the updated GitHub Actions workflow. Make sure to replace placeholder values (like your-username, your-domain.com, etc.) with your actual values.
