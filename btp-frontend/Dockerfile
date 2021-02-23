FROM node:14.15 as ui-build

ARG NODE_ENV=dev
RUN mkdir -p /pal/frontend/
WORKDIR /pal/frontend/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:${NODE_ENV}

FROM nginx:1.19.7
ARG NODE_ENV=dev
COPY --from=ui-build /pal/frontend/build /usr/share/nginx/html
COPY nginx-${NODE_ENV}.conf /etc/nginx/conf.d/default.conf
EXPOSE 80