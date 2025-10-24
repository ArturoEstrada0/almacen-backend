FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Instala dependencias y compila la aplicación
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copia dependencias y artefactos compilados
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main"]
