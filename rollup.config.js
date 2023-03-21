import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'build/index.mjs',
      format: 'es',
      sourcemap: false,
    },
    {
      file: 'build/index.umd.js',
      name: 'ExecutionManager',
      format: 'umd',
      sourcemap: false,
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.esm.json',
      sourceMap: false,
    }),
  ],
};
