FROM node:13-alpine
EXPOSE 3000
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY . /usr/src/app/
RUN npm install
COPY CI/ESS/.env /usr/src/app/production/.env
COPY CI/ESS/.env /usr/src/app/.env
RUN npm run compile
ENV NODE_ENV=production
RUN npm prune
WORKDIR /usr/src/app/dist/
CMD ["node", "index.js"]
