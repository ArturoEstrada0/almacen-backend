# Publicar Backend (NestJS)

Instrucciones para publicar el backend en un repo propio y desplegar en Render/Railway sin Docker.

1) Crear repositorio en GitHub

Usa el script desde la raíz (requiere `gh`):

```bash
BACKEND_REPO=almacen-backend FRONTEND_REPO=almacen-frontend ./scripts/create_github_repos.sh
```

2) Configurar variables de entorno en la plataforma (Render / Railway)

- Para producción con Supabase usa la variable `DATABASE_URL` que Supabase te proporciona (Postgres connection string). Nuestro código detecta y usará `DATABASE_URL` si está presente.
- Variables imprescindibles:
  - DATABASE_URL (recomendado para Supabase)
  - OR alternativamente: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
  - JWT_SECRET
  - FRONTEND_URL (URL pública del frontend, para CORS)

3) Deploy sin Docker (Render)

- En Render crea un nuevo "Web Service" y selecciona Node environment.
- Root directory: `backend/` (si subiste el repo separado, root es `/`).
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

4) Migraciones

Si usas TypeORM migrations, añade un Deploy Command o Job que corra:

```
npm run migration:run
```

5) Notas

- Nuestro `backend/src/config/database.config.ts` prioriza `DATABASE_URL` (ideal para Supabase). Si no existe, usa las variables `DB_*`.
- Asegúrate de añadir las variables en Settings/Environment del repo en GitHub o en la UI del host.
