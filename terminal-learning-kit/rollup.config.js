/**
 * Rollup 配置文件
 * 用于构建生产版本
 */

import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const config = [
  // 核心库 - ESM
  {
    input: 'core/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // 核心库 - CJS
  {
    input: 'core/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // 核心库 - 类型定义
  {
    input: 'core/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
  // React 组件 - ESM
  {
    input: 'react/index.ts',
    output: {
      file: 'dist/react.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // React 组件 - CJS
  {
    input: 'react/index.ts',
    output: {
      file: 'dist/react.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // React 组件 - 类型定义
  {
    input: 'react/index.ts',
    output: {
      file: 'dist/react.d.ts',
      format: 'esm',
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [dts()],
  },
];

export default config;
