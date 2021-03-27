FROM node:14-buster
ARG FILES_TO_REMOVE
RUN apt-get update && \
  apt-get install -y netcat ffmpeg && \
  rm -rf /var/lib/apt/lists/*
COPY . /opt/app-sec-workshop
WORKDIR /opt/app-sec-workshop
RUN rm -rf ${FILES_TO_REMOVE} && npm install
EXPOSE 8080
EXPOSE 1337
ENV HOSTNAME='0.0.0.0'
CMD ["npm", "run", "start-vulnerable"]
