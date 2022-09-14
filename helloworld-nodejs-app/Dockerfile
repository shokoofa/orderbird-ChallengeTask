FROM node:alpine
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install apt-utils
RUN apt-get -y install nodejs
WORKDIR /usr/src/app
COPY server.js ./
EXPOSE 8080
CMD [ "node", "server.js" ]
