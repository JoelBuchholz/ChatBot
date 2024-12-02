# Backend
FROM node:18-alpine AS backend

WORKDIR /Backend

COPY Backend/package*.json ./

RUN npm ci

COPY Backend/ .
COPY Backend/.env ./

RUN npx prisma generate

# Frontend
FROM node:18-alpine AS frontend

WORKDIR /Frontend

COPY Frontend/package*.json ./

RUN npm ci

COPY Frontend/ .

RUN npm run build

# Final stage
FROM node:18-alpine

WORKDIR /

COPY --from=backend /Backend /Backend
COPY --from=frontend /Frontend /Frontend

COPY package*.json ./

RUN npm ci

EXPOSE 5173
EXPOSE 3000

CMD ["npm", "start"]
