FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

CMD ["npm", "start"]
