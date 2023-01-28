FROM node:18

RUN apt-get update && \
  apt-get install -y vim

RUN mkdir /home/node/app

WORKDIR /home/node/app

COPY src/ /home/node/app/

ENTRYPOINT [ "node", "index.js" ]