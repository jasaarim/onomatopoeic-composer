#! /usr/bin/env node
import { build } from 'esbuild'

console.log('Starting esbuild')

let ctx = await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  loader: { '.html': 'text' },
  outdir: './build',
})
