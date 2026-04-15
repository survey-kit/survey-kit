# Multi-stage: compile in the image so the bundle always matches src (avoids stale host dist/).

FROM public.ecr.aws/lambda/nodejs:20 AS builder
WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY tsconfig.json esbuild.config.js ./
COPY src ./src
RUN node esbuild.config.js

FROM public.ecr.aws/lambda/nodejs:20

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /build/dist/ ./

COPY package.lambda.json ./package.json

CMD ["index.handler"]
