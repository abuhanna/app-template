import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const sharedAlias = {
  '@cli': path.resolve(__dirname, '../create-apptemplate/src'),
};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: __dirname,
    include: ['e2e/**/*.test.ts'],
    alias: sharedAlias,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
