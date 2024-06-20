# Use a Node.js base image
FROM node:18-alpine

# set working directory
RUN mkdir /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package-lock.json /app/package-lock.json
COPY package.json /app/package.json

COPY . /app

RUN npm install

# Expose port 3000
EXPOSE 3000

# start app
CMD ["npm", "start"]