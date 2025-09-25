<div align="center">
  <img src="expearti_white.png" alt="EXPEARTI">
</div>
<div align="center">
  <h1>your trips budget manager</h1>
</div>

A full-stack application for managing vacation budgets, trip expenses, and participant coordination. Built with NestJS backend, Next.js frontend, and Kubernetes-ready deployment infrastructure.

![Dashboard](expearti.png)

## Features

- **Expense Tracking**: Track expenses across different categories
- **Trip Management**: Create and manage vacation trips with detailed planning
- **Participant Management**: Manage trip participants with roles and responsibilities
- **Activity Planning**: Plan and track trip activities with scheduling
- **Currency Support**: Multi-currency support with real-time exchange rates
- **Payment Management**: Track payments and settlements between participants
- **Email Notifications**: Automated email notifications for participants
- **Data Export**: Generate reports and summaries for trips and expenses

## Architecture

- **Backend**: NestJS API with TypeScript
- **Frontend**: Next.js with React and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and caching
- **Queue**: BullMQ for background job processing
- **Infrastructure**: Kubernetes with Helm charts for deployment
- **ERD**: [PostgreSQL Diagram on drawSQL](https://drawsql.app/teams/wsparcie/diagrams/budzetownik/embed)

## Launch

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Development Setup

1. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Set up environment variables
   cp .env.example .env

   # Start database with Docker
   docker-compose up db redis -d

   # Run database migrations
   npm run db:reset

   # Seed the database
   npm run seed

   # Start development server
   npm run start:dev
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Set up environment variables
   cp .env.example .env.local

   # Start development server
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5002
   - Backend API: http://localhost:5001
   - API Documentation: http://localhost:5001/api

## Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Kubernetes Deployment

### Using Helm

1. **Install Helm chart**

   ```bash
   cd devops/helm
   helm install budzetownik . --namespace budzetownik --create-namespace
   ```

2. **Development deployment**

   ```bash
   helm install budzetownik . -f values-dev.yaml --namespace budzetownik-dev --create-namespace
   ```

3. **Production deployment**
   ```bash
   helm install budzetownik . -f values-prod.yaml --namespace budzetownik-prod --create-namespace
   ```

### Manual Kubernetes Deployment

```bash
cd devops/kubernetes

# Apply database resources
kubectl apply -f database/

# Apply backend resources
kubectl apply -f backend/

# Apply frontend resources
kubectl apply -f frontend/
```

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/budzetownik"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="http://localhost:5001"
```

## License

This project is licensed under the MIT License.
