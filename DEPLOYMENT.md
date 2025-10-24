# Guía de Despliegue - Backend NestJS

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado
- npm o yarn

## Configuración de Producción

### 1. Variables de Entorno

Crear archivo `.env.production`:

\`\`\`env
NODE_ENV=production
PORT=3001

# Database
DATABASE_HOST=tu-host-produccion.com
DATABASE_PORT=5432
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password_seguro
DATABASE_NAME=almacen_prod
DATABASE_SSL=true

# JWT
JWT_SECRET=tu_secret_key_muy_seguro_y_largo
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=otro_secret_key_diferente
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://tu-frontend.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-app

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
\`\`\`

### 2. Build de Producción

\`\`\`bash
# Instalar dependencias
npm ci --only=production

# Build
npm run build

# El código compilado estará en /dist
\`\`\`

### 3. Ejecutar Migraciones

\`\`\`bash
npm run migration:run
\`\`\`

### 4. Iniciar Servidor

\`\`\`bash
# Modo producción
npm run start:prod

# Con PM2 (recomendado)
pm2 start dist/main.js --name almacen-api
pm2 save
pm2 startup
\`\`\`

## Despliegue en Railway

### 1. Crear Proyecto

\`\`\`bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
\`\`\`

### 2. Configurar Base de Datos

\`\`\`bash
# Agregar PostgreSQL
railway add postgresql

# Railway automáticamente configura DATABASE_URL
\`\`\`

### 3. Configurar Variables

En el dashboard de Railway, agregar:
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ORIGIN`

### 4. Deploy

\`\`\`bash
railway up
\`\`\`

## Despliegue en Render

### 1. Crear Web Service

1. Conectar repositorio de GitHub
2. Seleccionar rama `main`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`

### 2. Configurar Base de Datos

1. Crear PostgreSQL database en Render
2. Copiar Internal Database URL
3. Agregar como variable de entorno `DATABASE_URL`

### 3. Variables de Entorno

Agregar en Render dashboard:
- `NODE_ENV=production`
- `JWT_SECRET`
- `CORS_ORIGIN`

## Despliegue en DigitalOcean

### 1. Crear Droplet

\`\`\`bash
# Ubuntu 22.04 LTS
# Mínimo: 2GB RAM, 1 vCPU
\`\`\`

### 2. Configurar Servidor

\`\`\`bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar PM2
sudo npm install -g pm2
\`\`\`

### 3. Configurar PostgreSQL

\`\`\`bash
sudo -u postgres psql

CREATE DATABASE almacen_prod;
CREATE USER almacen_user WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE almacen_prod TO almacen_user;
\q
\`\`\`

### 4. Clonar y Configurar Proyecto

\`\`\`bash
cd /var/www
git clone tu-repositorio.git almacen-backend
cd almacen-backend/backend

# Instalar dependencias
npm ci --only=production

# Configurar .env
nano .env.production

# Build
npm run build

# Ejecutar migraciones
npm run migration:run

# Iniciar con PM2
pm2 start dist/main.js --name almacen-api
pm2 save
pm2 startup
\`\`\`

### 5. Configurar Nginx

\`\`\`bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/almacen-api
\`\`\`

Contenido:

\`\`\`nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/almacen-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### 6. Configurar SSL con Let's Encrypt

\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.tu-dominio.com
\`\`\`

## Monitoreo

### PM2 Monitoring

\`\`\`bash
# Ver logs
pm2 logs almacen-api

# Monitorear recursos
pm2 monit

# Reiniciar
pm2 restart almacen-api

# Ver status
pm2 status
\`\`\`

### Health Check

Configurar monitoreo en:
- UptimeRobot
- Pingdom
- StatusCake

Endpoint: `GET /api/health`

## Backups

### Base de Datos

\`\`\`bash
# Backup manual
pg_dump -U almacen_user -d almacen_prod > backup_$(date +%Y%m%d).sql

# Backup automático (cron)
0 2 * * * pg_dump -U almacen_user -d almacen_prod > /backups/backup_$(date +\%Y\%m\%d).sql
\`\`\`

### Archivos

\`\`\`bash
# Backup de uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
\`\`\`

## Troubleshooting

### Logs

\`\`\`bash
# PM2 logs
pm2 logs almacen-api --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
\`\`\`

### Problemas Comunes

**Error de conexión a base de datos:**
- Verificar credenciales en .env
- Verificar que PostgreSQL esté corriendo
- Verificar firewall

**Error 502 Bad Gateway:**
- Verificar que la aplicación esté corriendo
- Verificar puerto en Nginx config
- Revisar logs de PM2

**Memoria insuficiente:**
- Aumentar RAM del servidor
- Configurar swap
- Optimizar queries de base de datos

## Seguridad

### Firewall

\`\`\`bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
\`\`\`

### Actualizaciones

\`\`\`bash
# Sistema
sudo apt update && sudo apt upgrade -y

# Dependencias
npm audit
npm audit fix
\`\`\`

### Rate Limiting

Configurar en Nginx:

\`\`\`nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    # ... resto de config
}
