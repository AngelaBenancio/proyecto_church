# Stage 1: Instalar dependencias necesarias
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de empaquetado para instalar dependencias de producción y compilación
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Compilar la aplicación Next.js
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar la telemetría de Next.js en la compilación
ENV NEXT_TELEMETRY_DISABLED=1

# Generar el cliente de Prisma basado en el esquema actual
RUN npx prisma generate

# Compilar Next.js en producción
RUN npm run build

# Stage 3: Runner de producción ligero
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear un usuario de sistema sin privilegios para mayor seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar recursos estáticos y compilados
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El comando de arranque se delega a docker-compose para ejecutar las migraciones de Prisma al iniciar
CMD ["npm", "run", "start"]
