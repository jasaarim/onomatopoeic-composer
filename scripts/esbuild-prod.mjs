#! /usr/bin/env node
import { build } from 'esbuild'

console.log('Starting esbuild')

let ctx = await build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  minify: true,
  loader: { '.html': 'text' },
  outdir: './build',
})
