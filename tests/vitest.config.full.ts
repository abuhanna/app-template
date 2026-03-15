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
    include: ['e2e/layer2/**/*.test.ts'],
    alias: sharedAlias,
    testTimeout: 300_000,
    hookTimeout: 120_000,
    pool: 'forks',
    poolOptions: {
      forks: { maxForks: 2 },
    },
    globalSetup: [path.join(__dirname, 'e2e/helpers/vitest-global-setup.ts')],
  },
});
