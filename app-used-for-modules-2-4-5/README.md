<div align="center">
  <img src="expearti_white.png" alt="EXPEARTI">
</div>
<div align="center">
  <h1>your trips budget manager</h1>
</div>
The full-stack application for managing vacation budgets, trip expenses, and participant coordination. Built with NestJS backend, Next.js frontend, and Kubernetes-ready deployment infrastructure.

![Dashboard](budzetownik.png)

## Features

- **Trip Management**: Create and manage vacation trips with detailed planning
- **Expense Tracking**: Track expenses across different categories
- **Participant Management**: Manage trip participants with roles and responsibilities
- **Activity Planning**: Plan and track trip activities with scheduling
- **Currency Support**: Multi-currency support with real-time exchange rates
- **Payment Management**: Track payments and settlements between participants
- **Email Notifications**: Automated email notifications for participants
- **User Authentication**: JWT-based authentication with role-based access control
- **Data Export**: Generate reports and summaries for trips and expenses

## Architecture

- **Backend**: NestJS API with TypeScript
- **Frontend**: Next.js with React and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and caching
- **Queue**: BullMQ for background job processing
- **Infrastructure**: Kubernetes with Helm charts for deployment

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd budzetownik
   ```

2. **Backend Setup**

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

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Set up environment variables
   cp .env.example .env.local

   # Start development server
   npm run dev
   ```

4. **Access the application**
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

## Database Schema

[PostgreSQL Diagram on drawSQL](https://drawsql.app/teams/wsparcie/diagrams/budzetownik/embed):

- **Users**: Authentication and user management
- **Trips**: Main trip entities with categories and budgets
- **Participants**: People involved in trips with roles
- **Activities**: Planned activities within trips
- **Expenses**: Expense tracking with categories
- **Payments**: Payment records and settlements
- **Currencies**: Multi-currency support with exchange rates

### Key Relationships

- Users can participate in multiple trips
- Trips contain multiple activities and expenses
- Participants can be assigned to specific activities
- Expenses can be linked to trips, activities, or participants
- Payments track financial transactions between participants

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

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation using class-validator
- CORS configuration for cross-origin requests
- Environment-based configuration
- Secure password hashing with bcrypt

## Deployment

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use managed PostgreSQL service (e.g., AWS RDS, Google Cloud SQL)
3. **Redis**: Use managed Redis service for production
4. **SSL**: Enable HTTPS with proper SSL certificates
5. **Monitoring**: Set up application monitoring and logging
6. **Backup**: Configure database backups
7. **Scaling**: Use Kubernetes horizontal pod autoscaling

## License

This project is licensed under the MIT License.
