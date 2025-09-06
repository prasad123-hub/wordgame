# Word Game Server

A Node.js/TypeScript server for the word game application with MongoDB integration.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Yarn package manager

## Environment Setup

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your desired configuration:
   ```env
   NODE_ENV=development
   PORT=8000
   MONGODB_URI=mongodb://admin:password123@localhost:27017
   CORS_ORIGIN=*
   ```

## Production Database Configuration

For production deployment, you need to provide your production database URI. Here are the options:

### Option 1: Environment Variables
Set the `MONGODB_URI` environment variable:
```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/wordgame"
```

### Option 2: .env File
Create a `.env` file with your production database URI:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wordgame
CORS_ORIGIN=https://yourdomain.com
```

### Option 3: Docker Compose Environment
Update `docker-compose.prod.yml` with your production database URI:
```yaml
environment:
  MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/wordgame
```

## Docker Commands

### Development Setup

1. **Start development environment (app + local MongoDB):**
   ```bash
   # Start all services with hot reload
   yarn docker:up
   
   # View logs
   yarn docker:logs
   
   # Stop services
   yarn docker:down
   ```

### Production Setup

1. **Start production environment (app + external database):**
   ```bash
   # Set your production database URI first
   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/wordgame"
   
   # Start production services
   yarn docker:prod:up
   
   # View logs
   yarn docker:prod:logs
   
   # Stop services
   yarn docker:prod:down
   ```

2. **Build and run manually:**
   ```bash
   # Build the Docker image
   yarn docker:build
   
   # Run the container
   yarn docker:run
   ```


### Maintenance Commands

```bash
# Clean up all containers, volumes, and images
yarn docker:clean

# View running containers
docker ps

# Access MongoDB shell
docker exec -it wordgame-mongodb mongosh -u admin -p password123

# Access application container shell
docker exec -it wordgame-server sh
```

## Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start MongoDB locally:**
   ```bash
   # Using Docker for MongoDB only
   docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0
   ```

3. **Start the development server:**
   ```bash
   yarn dev
   ```

## API Endpoints

- `GET /` - Health check endpoint

## Services

- **Application**: Runs on port 8080
- **MongoDB**: Runs on port 27017
- **Database**: `wordgame`

## Health Checks

The application includes health checks that verify:
- Server is responding on port 8080
- Application is healthy and ready to accept requests

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :8080
   
   # Kill the process or use a different port
   PORT=3000 yarn dev
   ```

2. **MongoDB connection issues:**
   - Ensure MongoDB container is running
   - Check the MONGODB_URI in your .env file
   - Verify network connectivity between containers

3. **Docker build issues:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t wordgame-server .
   ```

### Logs

- Application logs: `yarn docker:logs`
- MongoDB logs: `docker logs wordgame-mongodb`
- Development logs: `docker-compose -f docker-compose.dev.yml logs -f app`
