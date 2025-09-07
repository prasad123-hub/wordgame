#!/bin/bash

# Docker cleanup script for self-hosted runners
# This script helps prevent disk space issues by cleaning up Docker artifacts

set -e

echo "Starting Docker cleanup..."

# Show current disk usage
echo "Current disk usage:"
df -h

# Stop and remove all containers
echo "Stopping and removing all containers..."
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# Remove all images
echo "Removing all Docker images..."
sudo docker rmi $(sudo docker images -aq) 2>/dev/null || true

# Remove all volumes
echo "Removing all Docker volumes..."
sudo docker volume rm $(sudo docker volume ls -q) 2>/dev/null || true

# Remove all networks (except default)
echo "Removing custom Docker networks..."
sudo docker network rm $(sudo docker network ls -q --filter type=custom) 2>/dev/null || true

# Clean up Docker system
echo "Cleaning up Docker system..."
sudo docker system prune -af --volumes

# Clean up old logs
echo "Cleaning up old log files..."
sudo find /var/log -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -name "*.gz" -type f -mtime +7 -delete 2>/dev/null || true

# Clean up temporary files
echo "Cleaning up temporary files..."
sudo find /tmp -type f -mtime +7 -delete 2>/dev/null || true
sudo find /var/tmp -type f -mtime +7 -delete 2>/dev/null || true

# Clean up package manager caches
echo "Cleaning up package manager caches..."
sudo apt-get clean 2>/dev/null || true
sudo apt-get autoclean 2>/dev/null || true
sudo apt-get autoremove -y 2>/dev/null || true

# Show final disk usage
echo "Final disk usage:"
df -h

echo "Cleanup completed successfully!"
