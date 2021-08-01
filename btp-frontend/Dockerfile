FROM node:14.15

RUN mkdir -p /code/
WORKDIR /code/
COPY package*.json .
RUN npm ci

EXPOSE 4200

CMD [ "npm", "start:docker" ]

