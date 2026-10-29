import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Test against the React binding's source so it shares this package's React, as it does in an app.
  resolve: {
    alias: [
      { find: /^@relay-sdk\/react$/, replacement: here('../sdk-react/src/index.tsx') },
      { find: /^react$/, replacement: here('./node_modules/react') },
      { find: /^react\/jsx-runtime$/, replacement: here('./node_modules/react/jsx-runtime') },
      { find: /^react-dom$/, replacement: here('./node_modules/react-dom') },
    ],
  },
  test: { environment: 'jsdom' },
});
