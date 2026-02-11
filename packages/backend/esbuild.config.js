import * as esbuild from 'esbuild'

const isWatch = process.argv.includes('--watch')

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: true,
  minify: !isWatch,
  external: [
    // AWS SDK v3 is available in Lambda runtime
    '@aws-sdk/*',
  ],
  banner: {
    // Required for ESM compatibility with some CommonJS modules
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
}

if (isWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await esbuild.build(buildOptions)
  console.log('Build complete')
}
