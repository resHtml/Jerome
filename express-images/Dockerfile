FROM node:12.16

RUN apt-get update && \ 
	apt-get install -y vim

CMD ["npm", "install", "chance"]
COPY src/ /opt/app/
CMD ["node", "/opt/app/index.js"]
