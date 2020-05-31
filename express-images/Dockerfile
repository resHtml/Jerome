FROM node:12.16

RUN apt-get update && \ 
	apt-get install -y vim

CMD ["npm", "install", "chance"]
CMD ["npm", "install", "dockerode"]
COPY src/ /opt/app/
CMD ["node", "/opt/app/index.js"]
