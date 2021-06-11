FROM node:14.15

RUN mkdir -p /code/
WORKDIR /code/
COPY package*.json .
RUN npm ci

EXPOSE 8080

CMD [ "npm", "start" ]

