FROM node:20-alpine

RUN apk add --no-cache git bash netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x start.sh

EXPOSE 3333

CMD ["bash", "./start.sh"]
