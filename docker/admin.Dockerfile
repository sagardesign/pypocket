FROM node:18-alpine

WORKDIR /app

COPY package.json ./
# Copy workspace packages and configurations
COPY apps/admin/package.json ./apps/admin/

# If we have shared packages, copy them too:
COPY packages/ ./packages/

RUN npm install --include=dev

COPY apps/admin/ ./apps/admin/

EXPOSE 3001

CMD ["npm", "run", "dev", "-w", "apps/admin"]
