FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate

CMD ["npm", "run", "seed"]
