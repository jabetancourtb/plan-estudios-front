# ---------- Build (Angular) ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependencias con cache eficiente
COPY package*.json ./
RUN npm ci

# Copia el resto del código
COPY . .

# Parámetros opcionales de build
ARG BASE_HREF=/
ARG DEPLOY_URL=/

# Compila en modo producción
# Nota: el output por defecto en Angular 15+ queda en dist/<app>/browser
RUN npx ng build --configuration=production --base-href=$BASE_HREF --deploy-url=$DEPLOY_URL

# ---------- Runtime (Nginx) ----------
FROM nginx:1.27-alpine AS runtime

# Limpia la config por defecto y agrega una optimizada para SPA
RUN rm -f /etc/nginx/conf.d/default.conf \
 && cat > /etc/nginx/conf.d/default.conf <<'NGINX_CONF'
server {
  listen 80;
  server_name _;

  # Carpeta de archivos estáticos
  root /usr/share/nginx/html;

  # Gzip básico
  gzip on;
  gzip_types text/plain text/css application/json application/javascript application/rss+xml application/xml image/svg+xml;
  gzip_min_length 1024;

  # Cache estático
  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
    expires 30d;
    access_log off;
    try_files $uri =404;
  }

  # SPA fallback (Angular router)
  location / {
    try_files $uri $uri/ /index.html;
  }
}
NGINX_CONF

# Copia el build (nota el comodín */browser)
COPY --from=build /app/dist/*/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
