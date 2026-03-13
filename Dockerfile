FROM node:24-alpine AS base
WORKDIR /app

# ------- deps -------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ------- build -------
FROM deps AS build
COPY . .
RUN node ace build

# ------- production -------
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/build ./
RUN npm ci --omit=dev
EXPOSE 3333
CMD ["node", "bin/server.js"]
