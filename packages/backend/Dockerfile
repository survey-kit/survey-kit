# Use AWS Lambda Node.js 20 base image (arm64 - matches M-series Mac, no cross-build needed)
FROM public.ecr.aws/lambda/nodejs:20

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application
COPY dist/ ./

# Override package.json so Node loads index.js as CommonJS (package has type:module)
COPY package.lambda.json ./package.json

# Set the handler
CMD ["index.handler"]
