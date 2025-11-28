## React + Express + PostgreSQL Sample (Amplify + Lambda Ready)

This repository contains a minimal full-stack example used to validate AWS Amplify (frontend hosting) and AWS Lambda (backend) deployments backed by PostgreSQL. The app is a simple todo dashboard that demonstrates CRUD operations across the stack:

- **Frontend**: React + Vite + TypeScript (`frontend/`)
- **Backend**: Express + TypeScript targeting AWS Lambda via `serverless-http` (`backend/`)
- **ORM**: Prisma for PostgreSQL schema + migrations (`backend/prisma/`)
- **Database**: PostgreSQL (RDS, Aurora Serverless, or any managed Postgres that Lambda can reach)

Both apps include `.env.example` files so you can create your own environment files without committing sensitive values.

---

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (local Docker container or managed service)
- AWS account with access to Amplify Hosting, Lambda, API Gateway, IAM, and an accessible PostgreSQL instance (for production)

---

### Local Development

#### 1. Backend

```bash
cd backend
cp .env.example .env   # update values (DATABASE_URL is easiest)
npm install
npm run dev            # starts Express on http://localhost:4000
```

Run migrations the first time (and whenever the schema changes):

```bash
npm run prisma:migrate -- --name init
```
> drop the `--name` flag after the initial migration; Prisma will prompt for a new name whenever you modify the schema.

#### 2. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_BASE_URL (http://localhost:4000 for local dev)
npm install
npm run dev            # launches Vite dev server (defaults to http://localhost:5173)
```

Open the browser, add a todo, toggle completion, and delete an item to exercise all API paths.

---

### Environment Variables

| Location         | Key                | Description                                                                 |
| ---------------- | ------------------ | --------------------------------------------------------------------------- |
| `backend/.env`   | `PORT`             | Local dev server port (defaults to `4000`)                                  |
|                  | `DATABASE_URL`     | Postgres connection string used by Prisma                                   |
|                  | `CORS_ORIGINS`     | Comma-separated list of allowed origins (e.g., Amplify domain)              |
| `frontend/.env`  | `VITE_API_BASE_URL`| Fully qualified API Gateway/Lambda URL (no trailing slash)                  |

Never commit the `.env` files—AWS console or CI/CD pipeline variables should provide production values.

---

### Deploying the Backend to AWS Lambda

1. **Build artifacts**
   ```bash
   cd backend
   npm install
   npm run build
   npm prune --production
   ```
   Zip the `dist/` directory and the pruned `node_modules/` together:
   ```bash
   powershell Compress-Archive -Path dist,node_modules,package.json,package-lock.json -DestinationPath backend.zip
   ```

2. **Create the Lambda function**
   - Runtime: **Node.js 20.x**
   - Handler: `dist/index.handler`
   - Architecture: x86_64 (default)
   - Upload `backend.zip` to the function.

3. **Configure environment variables** matching `.env.example` (especially database credentials and `CORS_ORIGINS`).

4. **Run migrations in the cloud**
   - From your CI machine or workstation, execute `npm run db:migrate` with `DATABASE_URL` pointing at the production database (can be done via an AWS CodeBuild job or GitHub Action using Secrets Manager).

5. **Networking**
   - If your Postgres lives inside a VPC (e.g., RDS), add the Lambda to the same VPC/subnets and ensure security groups allow traffic on port 5432.

6. **Expose the Lambda through HTTPS**
   - Add a Function URL **or** (recommended) create an HTTP API in API Gateway
   - Route `ANY /{proxy+}` to the Lambda handler
   - Enable CORS using the same origins configured for the backend

7. **Test**
   - `curl https://<api-id>.execute-api.<region>.amazonaws.com/health`
   - Exercise `/api/todos` endpoints

---

### Standing Up PostgreSQL in AWS

Simplest option: **Amazon RDS for PostgreSQL**

1. Create a new RDS PostgreSQL instance (Free Tier if eligible) or Aurora Serverless v2 cluster.
2. Note the hostname, port, database name, username, and password.
3. Ensure the security group allows inbound access from the Lambda security group (or from your IP for initial testing).
4. Apply the Prisma migration to create tables/extension:
   ```bash
   cd backend
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```
   This runs the SQL found in `prisma/migrations/0001_init/migration.sql` (creates `uuid-ossp` and the `todos` table).

---

### Deploying the Frontend with AWS Amplify Hosting

1. Push this repository to GitHub/CodeCommit/Bitbucket.
2. In Amplify console, **New app > Host web app** and connect the repo/branch.
3. Build settings for Vite:
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
4. Add an environment variable `VITE_API_BASE_URL` pointing to your API Gateway/Lambda URL (e.g., `https://<api-id>.execute-api.<region>.amazonaws.com`).
5. Deploy. Amplify gives you a domain like `https://main.d123.amplifyapp.com`.
6. Add that URL to the backend `CORS_ORIGINS` list (`https://main.d123.amplifyapp.com`) and redeploy/restart the Lambda if needed.

---

### Testing Checklist

- `cd backend && npm run lint && npm run build`
- `cd frontend && npm run build`
- Local manual verification at `http://localhost:5173`
- After AWS deployment:
  - `GET https://<api>/health`
  - Use Amplify domain to create/toggle/delete todos

---

### Next Steps / Enhancements

- Add authentication (Cognito or IAM authorizers)
- Add infrastructure as code (SAM/Serverless Framework/Terraform)
- Introduce automated migrations (Prisma, Drizzle, or Knex)
- Create CI workflows for lint/test/build on push

This foundation is intentionally small so you can focus on testing AWS Amplify + Lambda + PostgreSQL end-to-end. Modify freely to match your production architecture.
