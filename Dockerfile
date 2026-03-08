FROM oven/bun:latest

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bunx playwright install-deps
RUN bunx playwright install chromium

ENTRYPOINT [ "bun", "run", "/app/index.ts" ]
