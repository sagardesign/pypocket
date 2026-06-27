FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# Copy workspace packages and configurations
COPY apps/web/package.json ./apps/web/

# If we have shared packages, copy them too:
COPY packages/ ./packages/

RUN npm install --include=dev

COPY apps/web/ ./apps/web/

EXPOSE 3000

CMD ["npm", "run", "dev", "-w", "apps/web"]
