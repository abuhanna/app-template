import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { sharedAlias } from './vitest.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: __dirname,
    include: ['e2e/layer1/**/*.test.ts'],
    alias: sharedAlias,
    testTimeout: 10_000,
  },
});
