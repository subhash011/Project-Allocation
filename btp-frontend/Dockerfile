FROM node:14.15 as ui-build
RUN mkdir -p /pal/frontend/
WORKDIR /pal/frontend/
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.19.7
COPY --from=ui-build /pal/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80