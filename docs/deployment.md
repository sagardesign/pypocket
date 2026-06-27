# PyPocket Production Deployment Guide

This guide details steps to take PyPocket to production hosting environments (e.g. AWS, GCP, DigitalOcean, Heroku, or Vercel).

## Architecture Layout

```
                        [ Students / Smartphones ]
                                    |
                               (HTTPS / PWA)
                                    |
                           [ Traefik / Nginx ]
                            /               \
              [ apps/web ] (Port 3000)   [ apps/api ] (Port 8000)
                                            |
                                  [ apps/compiler ] (Port 8001)
                                  [ PostgreSQL ] (DB)
                                  [ Redis ] (Leaderboards)
```

## Prerequisite Configurations

1. **Docker & Docker Compose**: Ensure Docker v20+ is installed on the host VPS.
2. **Domain SSL Configuration**: Obtain SSL certificates (e.g., via Let's Encrypt).
3. **API Secrets**: Configure strong keys for JWT in environment variables.

---

## Production Deployment using Docker Compose

1. **Clone project to host server**:
   ```bash
   git clone https://github.com/your-username/pypocket.git
   cd pypocket
   ```

2. **Configure Environment Variables (`.env` file)**:
   Create a `.env` file in the root workspace directory with the following variables:
   ```env
   # API Secrets
   JWT_SECRET=generaterandomalphanumerickeyhere987!
   
   # Database credentials
   POSTGRES_DB=pypocket_prod
   POSTGRES_USER=db_admin_user
   POSTGRES_PASSWORD=supersecurepasswordhere777
   
   # Service endpoints
   DATABASE_URL=postgresql://db_admin_user:supersecurepasswordhere777@db:5432/pypocket_prod
   REDIS_URL=redis://redis:6379/0
   COMPILER_SERVICE_URL=http://compiler:8001
   
   # Frontend endpoint URL
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. **Deploy Container Cluster**:
   Execute the docker-compose run command in detached mode:
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

---

## Production Security Checklists

* **Compiler Subprocess Isolation**: The compiler runner microservice is set to `read_only` file storage access with a `tmpfs` mounted on `/tmp`. Do not expose the compiler container (Port 8001) directly to public internet routers. Keep it accessible only inside the internal Docker bridge network.
* **Firewall configurations**: Enforce strict firewall rules restricting access to ports `5432` (PostgreSQL) and `6379` (Redis).
* **Vercel Frontend Hosting Alternative**: If desired, the `apps/web` Next.js frontend can be deployed directly to Vercel. Set `NEXT_PUBLIC_API_URL` to point to the host address of your FastAPI server.
