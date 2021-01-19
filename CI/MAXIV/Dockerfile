FROM node:14-alpine

EXPOSE 3000

WORKDIR /home/node/app/
COPY package*.json /home/node/app/

RUN chown -R node:node /home/node/app
USER node

RUN npm ci


COPY --chown=node:node . /home/node/app/
COPY --chown=node:node CI/MAXIV/.env /home/node/app/production/.env
COPY --chown=node:node CI/MAXIV/.env /home/node/app/.env
COPY --chown=node:node CI/MAXIV/mongo-dao.ts /home/node/app/src/providers/plexus-provider/dao/mongo-dao.ts
COPY --chown=node:node CI/MAXIV/openaire-mapper.ts /home/node/app/src/providers/plexus-provider/repository/openaire-mapper.ts

RUN npm run compile
ENV NODE_ENV="production"
RUN npm prune

WORKDIR /home/node/app/dist/

CMD ["node", "index.js"]
