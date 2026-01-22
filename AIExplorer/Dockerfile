# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ENV NODE_ENV=production
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_MSAL_CLIENT_ID
ARG NEXT_PUBLIC_MSAL_TENANT_ID
ARG NEXT_PUBLIC_MSAL_REDIRECT_URI
ARG NEXT_PUBLIC_MSAL_SCOPES
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_MSAL_CLIENT_ID=$NEXT_PUBLIC_MSAL_CLIENT_ID
ENV NEXT_PUBLIC_MSAL_TENANT_ID=$NEXT_PUBLIC_MSAL_TENANT_ID
ENV NEXT_PUBLIC_MSAL_REDIRECT_URI=$NEXT_PUBLIC_MSAL_REDIRECT_URI
ENV NEXT_PUBLIC_MSAL_SCOPES=$NEXT_PUBLIC_MSAL_SCOPES
COPY . .
RUN npm run build

FROM base AS runner
ENV NEXT=production
ENV NEXT_PUBLIC_APP_ENV=prod
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json package-lock.json ./
USER nextjs
EXPOSE 3000
CMD ["npm","run","start"]

 
