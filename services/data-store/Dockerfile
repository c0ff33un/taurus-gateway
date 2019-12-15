FROM node:12.7.0-alpine

COPY package.json /taurus-api/

COPY package-lock.json /taurus-api/

WORKDIR /taurus-api/

RUN npm install

COPY . /taurus-api/

ENTRYPOINT ["node", "index.js"]

