import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: { NODE_ENV: 'test' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/dtos/task-response.dto.ts', 'src/dtos/task-stats.dto.ts'],
      reporter: ['text', 'html'],
    },
  },
});
