FROM node:14.15
RUN mkdir -p /pal/backend
WORKDIR /pal/backend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]

