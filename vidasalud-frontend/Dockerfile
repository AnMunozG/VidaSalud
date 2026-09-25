# syntax=docker/dockerfile:1

# ── Etapa de build: genera el build de Vite ───────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ARG VITE_USE_MOCKS=true
ARG VITE_USE_API_PRESTACIONES=false
ARG VITE_USE_API_ATENCIONES=false
ARG VITE_MSAL_CLIENT_ID
ARG VITE_MSAL_TENANT_ID
ARG VITE_MSAL_REDIRECT_URI=https://vidasalud.duckdns.org
ARG VITE_MSAL_SCOPES
ENV VITE_API_URL=$VITE_API_URL \
    VITE_USE_MOCKS=$VITE_USE_MOCKS \
    VITE_USE_API_PRESTACIONES=$VITE_USE_API_PRESTACIONES \
    VITE_USE_API_ATENCIONES=$VITE_USE_API_ATENCIONES \
    VITE_MSAL_CLIENT_ID=$VITE_MSAL_CLIENT_ID \
    VITE_MSAL_TENANT_ID=$VITE_MSAL_TENANT_ID \
    VITE_MSAL_REDIRECT_URI=$VITE_MSAL_REDIRECT_URI \
    VITE_MSAL_SCOPES=$VITE_MSAL_SCOPES
RUN npm run build

# ── Etapa de runtime: sirve el build con nginx ────────────
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -q --no-check-certificate -O /dev/null https://127.0.0.1/ || exit 1