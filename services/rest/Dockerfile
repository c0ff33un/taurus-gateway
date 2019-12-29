FROM node:12.7.0-alpine

COPY package.json /taurus-api/

COPY package-lock.json /taurus-api/

WORKDIR /taurus-api/

RUN npm install --no-optional && npm cache clean --force

COPY . /taurus-api/

RUN npm run build

ENTRYPOINT ["node", "dist/server"]
