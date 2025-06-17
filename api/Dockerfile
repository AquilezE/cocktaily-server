# api/Dockerfile


FROM node:23.9.0-alpine
WORKDIR /app
COPY package.json package-lock.json ./
run npm ci --production

COPY .env .env
COPY config/serviceAccountKey.json config/serviceAccountKey.json

COPY . .

VOLUME [ "/app/uploads" ]
EXPOSE 3000
CMD ["node", "server.js"]

