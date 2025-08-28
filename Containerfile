FROM node:20-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy app code + .env
COPY . .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "app.js"]
