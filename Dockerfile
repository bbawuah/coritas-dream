FROM node:16.13

ENV PORT 3000

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm run build
# run this for production

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]