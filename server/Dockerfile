FROM node:22-alpine

WORKDIR /server

COPY package*.json .

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD [ "npm", "start" ]