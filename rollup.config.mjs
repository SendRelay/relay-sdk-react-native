import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.tsx',
  output: [
    { file: 'dist/index.js', format: 'cjs', sourcemap: true, exports: 'named' },
    { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
  ],
  plugins: [typescript({ tsconfig: './tsconfig.json', declaration: true, declarationDir: 'dist', rootDir: 'src' })],
  external: ['react', 'react/jsx-runtime', 'react-native', '@relay-sdk/react', '@relay-sdk/sdk-browser'],
});
