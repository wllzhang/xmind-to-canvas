import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';
import terser from '@rollup/plugin-terser';

const isProd = (process.env.BUILD === 'production');

// Obsidian plugin build
const obsidianBuild = {
  input: 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    sourcemapExcludeSources: isProd,
    format: 'cjs',
    exports: 'default',
    name: 'main.js'
  },
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins
  ],
  plugins: [
    typescript(),
    nodeResolve({ browser: false }),
    commonjs(),
    json(),
  ]
};

// Web core library build (UMD format for browser usage)
const webBuild = {
  input: 'src/core/index.ts',
  output: {
    file: 'web/xmind-to-canvas.umd.js',
    format: 'umd',
    name: 'XMindToCanvas',
    sourcemap: !isProd,
    globals: {
      'jszip': 'JSZip',
      'elkjs/lib/elk.bundled': 'ELK'
    }
  },
  external: ['jszip', 'elkjs/lib/elk.bundled'],
  plugins: [
    typescript({
      declaration: false,
      declarationMap: false,
    }),
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    isProd && terser(),
  ].filter(Boolean)
};

export default [obsidianBuild, webBuild];
