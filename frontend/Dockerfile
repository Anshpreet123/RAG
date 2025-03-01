# # Use Node.js as the base image
# FROM node:18-alpine

# # Set the working directory
# WORKDIR /app

# COPY package.json package-lock.json ./

# # Clean npm cache and force install
# RUN npm cache clean --force && npm install --legacy-peer-deps

# # Install dependencies

# # Copy the entire project (excluding .dockerignore files)
# COPY . .

# # Expose the default Vite port
# EXPOSE 5173

# # Start Vite dev server
# CMD ["npm", "run", "dev", "--", "--host"]

# Use a Debian-based Node.js image
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the default Vite port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
