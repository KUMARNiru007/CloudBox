FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY public ./public

CMD ["node", "src/index.js"]