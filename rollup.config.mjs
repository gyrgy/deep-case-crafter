import { createRequire } from 'node:module';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import { dts } from 'rollup-plugin-dts';

// package.json is read via createRequire so this config works on Node 20+
// without relying on JSON import attributes.
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

export default [
  // JavaScript bundles (CJS + ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: false,
      },
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: [
          '**/__tests__/**',
          '**/__type-tests__/**',
          '**/__test-utils__/**',
          '**/*.test.ts',
          '**/benchmark/**',
        ],
        rootDir: 'src',
        declaration: false,
        declarationMap: false,
      }),
      terser(),
      visualizer({
        filename: './stats/stats.html',
      }),
    ],
  },
  // Type declarations, bundled into a single self-contained file and emitted
  // under each extension a dual package needs (.d.ts / .d.mts / .d.cts).
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.d.ts', format: 'es' },
      { file: 'dist/index.d.mts', format: 'es' },
      { file: 'dist/index.d.cts', format: 'es' },
    ],
    plugins: [dts()],
  },
];
