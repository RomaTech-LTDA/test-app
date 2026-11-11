FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json .npmrc ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# @romatech/swagger builds the OpenAPI document from the TypeScript sources at
# runtime (sourcePatterns: ./src/**/*.ts); without them the spec is empty.
COPY tsconfig.json ./
COPY src ./src
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/server.js"]
