#! /usr/bin/env node
import { context } from 'esbuild'

console.log('Starting esbuild')

let ctx = await context({
  entryPoints: ['src/app.ts'],
  bundle: true,
  sourcemap: true,
  loader: { '.html': 'text' },
  outdir: 'build'
})

await ctx.watch()
console.log('Watching for changes')

const { host, port} = await ctx.serve({
  servedir: 'build'
})

console.log('Server running at', `http://${host}:${port}`)