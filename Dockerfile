FROM library/node:slim

COPY . /app

RUN cd /app \
  && npm install csv-parse elasticsearch hashcode collections --production

WORKDIR /app

CMD node .