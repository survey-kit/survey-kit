import * as esbuild from 'esbuild'
import { spawn } from 'child_process'

const isWatch = process.argv.includes('--watch')
const isDev = process.argv.includes('--dev')

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  entryPoints: [isDev ? 'src/server.ts' : 'src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: isDev ? 'dist/server.js' : 'dist/index.js',
  sourcemap: true,
  minify: !isWatch && !isDev,
  external: isDev
    ? [] // Include all deps when running locally
    : [
        // AWS SDK v3 is available in Lambda runtime
        '@aws-sdk/*',
      ],
  banner: {
    // Required for ESM compatibility with some CommonJS modules
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
}

if (isDev) {
  // Dev mode: build once then run the server, rebuild on change (Copilot helped here)
  let serverProcess = null

  function startServer() {
    if (serverProcess) serverProcess.kill()
    serverProcess = spawn('node', ['dist/server.js'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env },
    })
  }

  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [
      {
        name: 'restart-server',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length === 0) {
              startServer()
            }
          })
        },
      },
    ],
  })
  await ctx.watch()
  console.log('Watching for changes...')

  // Clean up on exit
  process.on('SIGINT', () => {
    if (serverProcess) serverProcess.kill()
    ctx.dispose()
    process.exit()
  })
} else if (isWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await esbuild.build(buildOptions)
  console.log('Build complete')
}
