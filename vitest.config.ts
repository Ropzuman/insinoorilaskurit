import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/lib/calculators/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/calculators/**/*.ts'],
      exclude: ['src/lib/calculators/__tests__/**'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
