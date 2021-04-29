FROM node:14-alpine

# This Dockerfile assumes that you have built production code using npm run compile

EXPOSE 3000
WORKDIR /

COPY package.json /
ENV NODE_ENV=production
RUN npm prune
COPY ./dist /
COPY ./node_modules /node_modules
CMD ["node", "index.js"]
