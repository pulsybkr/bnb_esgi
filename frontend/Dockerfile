FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

COPY . .

EXPOSE 5173

RUN npm run build

# Preview the built application
CMD ["npm", "run", "preview", "--", "--host"]
