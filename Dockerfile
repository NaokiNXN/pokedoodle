FROM node:alpine

# Create the directory!
RUN mkdir -p /usr/src/bot
RUN mkdir -p /usr/src/bot/database
WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json /usr/src/bot
RUN npm install

# Our precious bot
COPY . /usr/src/bot

# Start me!
CMD ["node", "index.js"]