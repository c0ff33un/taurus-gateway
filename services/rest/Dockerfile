FROM node:12.7.0-alpine as builder

COPY package.json /taurus-api/

COPY package-lock.json /taurus-api/

WORKDIR /taurus-api/

RUN npm install --no-optional && npm cache clean --force

COPY . /taurus-api/

ENTRYPOINT ["node", "dist/server"]
