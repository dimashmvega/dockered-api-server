FROM node:lts-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "start:dev" ]

FROM node:lts-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000

CMD [ "node", "dist/main.js" ]
