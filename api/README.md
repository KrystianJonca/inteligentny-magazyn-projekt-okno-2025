# Inteligentny Magazyn API

This repository contains the backend API for the Inteligentny Magazyn project. This guide will help frontend developers set up and interact with the API.

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inteligentny-magazyn-projekt-okno-2025/api
```

### 2. Environment Setup

The project should already contain the `.env.local` file, so no steps are needed here.

### 3. Start the API

Run the following command to build, start the services, run migrations, and seed the database:

```bash
make run
```

This single command will:

- Start the API and database containers
- Apply database migrations
- Seed the database with initial data

The API will be available at: http://localhost:8000

## API Documentation

Once the API is running, you can access the interactive API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Generating Frontend Types

To ensure type safety in your frontend application, you can generate TypeScript types directly from the running API:

### Install openapi-typescript

First, install the package if you haven't already:

```bash
npm install -g openapi-typescript
```

### Generate Types with a Single Command

Once the API is running, generate the types with a single command:

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/api/types.ts
```

This command fetches the OpenAPI specification directly from the running API and generates TypeScript types in one step.

### Using the Generated Types

Import and use the generated types in your frontend code:

```typescript
import { components } from "./api/types";

type Inventory = components["schemas"]["InventoryRead"];
type InventoryWithItem = components["schemas"]["InventoryWithItem"];
```

## Useful Commands

Here are some useful commands for working with the API:

```bash
# Start the services
make up

# Stop the services
make down

# Restart the services
make restart

# Rebuild the containers and restart
make rebuild

# View logs
make logs

# Access the API container shell
make shell

# Access the database shell
make db-shell

# Run tests
make test
```

## Database Migrations

If you need to work with database migrations:

```bash
# Apply migrations
make migrate

# Create a new migration (replace "your migration message" with a description)
make revision message="your migration message"
```

## Development Workflow

1. Start the API with `make run`
2. Use the API endpoints in your frontend application
3. Check the API documentation for available endpoints and request/response formats
4. Use `make logs` to troubleshoot any issues

## Troubleshooting

If you encounter any issues:

1. Check the logs with `make logs`
2. Ensure all containers are running with `docker-compose ps`
3. Try rebuilding the containers with `make rebuild`
4. Make sure your `.env.local` file has the correct configuration
