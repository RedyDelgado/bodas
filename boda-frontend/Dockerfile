# Frontend (Vite + React) multi-stage build
FROM node:20-alpine AS build
WORKDIR /app

# Instalar deps primero para aprovechar cache de capas
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Variables de entorno de build (inyectadas por docker-compose como build args)
ARG VITE_API_URL
ARG VITE_STORAGE_URL
ARG VITE_USE_FAKE
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_STORAGE_URL=${VITE_STORAGE_URL}
ENV VITE_USE_FAKE=${VITE_USE_FAKE}

# Copiar el resto del código y construir
COPY . .
RUN npm run build

# Etapa final: Nginx para servir la app estática
FROM nginx:1.27-alpine
# Usar config de prod si está disponible, si no, usar config estándar
COPY docker/nginx${NGINX_ENV:-.prod}.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
