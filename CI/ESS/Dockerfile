FROM node:13-alpine
EXPOSE 3000
WORKDIR /usr/src/app/
COPY package.json /usr/src/app/
COPY . /usr/src/app/
COPY CI/ESS/.env /usr/src/app/production/.env
COPY CI/ESS/.env /usr/src/app/.env
COPY CI/ESS/openaire-mapper.ts /usr/src/app/src/providers/plexus-provider/repository/openaire-mapper.ts
RUN npm install
RUN npm run compile
ENV NODE_ENV=production
RUN npm prune
WORKDIR /usr/src/app/dist/
CMD ["node", "index.js"]
