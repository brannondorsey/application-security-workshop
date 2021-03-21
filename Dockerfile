FROM node:14-buster
COPY . /opt/app-sec-workshop
WORKDIR /opt/app-sec-workshop
RUN npm install
EXPOSE 8080
EXPOSE 1337
ENV HOSTNAME='0.0.0.0'
CMD ["npm", "run", "start-vulnerable"]
