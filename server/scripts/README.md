# Server Scripts

This directory contains utility scripts for managing the wordgame server.

## cleanup.sh

A comprehensive Docker cleanup script designed to prevent disk space issues on self-hosted GitHub Actions runners.

### What it does:

1. **Docker Cleanup:**
   - Stops and removes all containers
   - Removes all Docker images
   - Removes all volumes
   - Removes custom networks
   - Runs `docker system prune` for comprehensive cleanup

2. **System Cleanup:**
   - Removes old log files (older than 7 days)
   - Cleans up temporary files
   - Cleans package manager caches

3. **Monitoring:**
   - Shows disk usage before and after cleanup

### Usage:

```bash
# Make the script executable
chmod +x cleanup.sh

# Run the cleanup
./cleanup.sh
```

### When to use:

- When you encounter "No space left on device" errors
- As part of your CI/CD pipeline (already integrated)
- As a scheduled maintenance task
- Before deploying new versions

### Safety:

The script uses `|| true` for most operations to prevent failures from stopping the entire cleanup process. It's designed to be safe to run regularly.

### Integration:

This script is automatically called by the GitHub Actions CD pipeline to prevent disk space issues on self-hosted runners.
