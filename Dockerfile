# ---------- Base ----------
FROM node:20-alpine

# Crea y usa el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json para instalar dependencias primero
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del proyecto
COPY . .

# Expone el puerto del servidor de Angular
EXPOSE 4200

# Variables opcionales para el build/serve
ARG NG_CONFIG=test

# Ejecuta Angular en modo test
CMD ["npm", "run", "start", "--", "--configuration=test", "--host", "0.0.0.0"]
