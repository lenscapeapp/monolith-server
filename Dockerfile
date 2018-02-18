FROM node:carbon

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install

COPY . .

EXPOSE 8080


CMD ["./node_modules/.bin/sequelize", "db:migrate", "&&", "node", "server.js"]
