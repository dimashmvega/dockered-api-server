🚀 dockered-api-server

Minimal, Docker-ready API server template using NestJS for building and deploying RESTful services. Designed for rapid deployment and includes comprehensive reporting features for product data by Dimas Martinez.

📋 Contents

Overview
Requirements
Quick Start (Docker)
API Endpoints
Local Development
Environment Variables
Testing and Linting
Important Notes for Evaluation

💡Overview

This project is a production-oriented API server scaffold built on NestJS and designed to run in Docker containers. The primary focus is on managing a product catalog and generating key business metrics.

Key Features:

Containerized Environment: Full docker compose configuration for easy setup.
Catalog Management: Endpoints for querying and deleting products (GET /products, DELETE /products/:sku).
Protected Reports: Generation of inventory health and catalog metrics using JWT authentication.
JWT Authentication: Simple login implementation for securing reporting endpoints.

⚙️ Requirements

Docker $\ge$ 20.x
Docker Compose (recommended for testing)
Node.js $\ge$ 18 (for local development)

🐳 Quick Start (Docker)

To build the image and launch the API server along with its database (as configured in docker-compose.yml):

Bash
docker compose up --build


Once the NestJS service is running (typically at http://localhost:3000), the API documentation will be available.
API Documentation (Swagger/OpenAPI):http://localhost:3000/api/docs

🗺️ API Endpoints

To test the protected reporting endpoints, you must first create a user and obtain a token.

| Method | Endpoint                 | Auth | Description |
|--------|---------------------------|-------|-------------|
| **POST**   | `/users`                 | No    | Creates a new user. **Crucial:** Use this user for subsequent login requests. |
| **POST**   | `/auth/login`            | No    | Generates the required JWT token for accessing protected routes. |
| **GET**    | `/products`              | No    | Retrieves products with support for comprehensive filtering (category, brand, price range) and pagination. |
| **DELETE** | `/products/:sku`         | No    | Performs a **soft delete** on a specific product from the table. |
| **GET**    | `/reports/metrics`       | JWT   | Provides high-level catalog metrics (active vs. deleted percentages, total records). |
| **GET**    | `/reports/inventory-health` | JWT | Generates a report on inventory health, grouped by category (e.g., average stock age, total stock value). |


🔑 Environment Variables

Note: Specific configuration variables (JWT_SECRET, database settings, Contentful integration keys) will be shared by Dimas Martinez via email.

An explicit .env file is required at the repository root, or variables must be passed directly to the Docker environment.

❗ Important Notes for Evaluation

External Data Synchronization (Contentful):

1. Sync Failure: The external Contentful endpoint used to initially populate the ProductEntity table is currently not working (likely due to an expired SPACE_ID or access token).

2. Implication: If the database products table is empty, the reporting endpoints (/reports/...) will return metrics based on zero records.

3. Action Required: To fully test the data synchronization and reporting functionality with real data, please replace the Contentful-related environment variables (SPACE_ID, ENVIRONMENT_EXTERNAL, etc.) with valid values.