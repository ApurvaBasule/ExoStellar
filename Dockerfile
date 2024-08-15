FROM node:lts-alpine

WORKDIR /app

# Copy and install dependencies for the client
COPY client/package*.json ./client/
RUN npm install --prefix client --omit=dev

# Copy and install dependencies for the server
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev

# Copy the rest of the client files and build the client
COPY client/ ./client/
RUN npm run build --prefix client

# Copy the server files after the client is built
COPY server/ ./server/

# Ensure the server/public directory exists
RUN mkdir -p ./server/public

# Move the built client files to the server's public directory
RUN cp -R ./client/build/* ./server/public/

USER node

# Start the server
CMD ["npm", "start", "--prefix", "server"]

# Expose the port
EXPOSE 5000

