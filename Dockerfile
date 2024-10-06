FROM node:12.16.1-alpine3.10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install


RUN apt-get update
  
RUN apt-get install default-jre

# Install Google Chrome
RUN apt-get install wget
RUN apt-get install ./google-chrome*.deb --yes
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -P /usr/bin/ && \ dpkg --unpack google-chrome-stable_current_amd64.deb && \ apt-get install -f -y,


COPY . .

ENV IP localhost
ENV PORT 4000
ENV NODE_ENV dev

EXPOSE 4000

CMD ["node", "server.js"]