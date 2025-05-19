# build stage
ARG NODE_VERSION=23.9.0

FROM node:${NODE_VERSION}-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]