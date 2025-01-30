FROM node:22.12.0-slim

RUN apt update 

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]