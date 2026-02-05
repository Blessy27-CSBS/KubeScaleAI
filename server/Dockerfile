FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
# We copy package.json from the root because the server depends on it or might track its own deps if separated.
# Assuming server/index.js relies on root package.json for now based on file structure.
COPY package*.json ./
RUN npm install

# Copy server code
COPY server/ ./server/

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
