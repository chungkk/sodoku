# Image cho Coolify. Cần Node >= 22.5 vì dùng node:sqlite có sẵn.
FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DATABASE_PATH=/app/data/solo.db

# server.ts là custom server (Next + Socket.IO) chạy bằng tsx, nên giữ cả mã nguồn thay vì output standalone
COPY --from=build --chown=node:node /app ./

# SQLite nằm ở /app/data → gắn Persistent Storage (volume) vào đây trên Coolify
RUN mkdir -p /app/data && chown node:node /app/data
VOLUME ["/app/data"]

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Seed chỉ tạo phần puzzle còn thiếu; lỗi seed không chặn app vì phòng chơi vẫn tự sinh được puzzle
CMD ["sh", "-c", "node_modules/.bin/tsx scripts/seed-puzzles.ts || echo 'Seed failed'; exec node_modules/.bin/tsx server.ts"]
