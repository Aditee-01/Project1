import { readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build as buildWithEsbuild } from 'esbuild'
import { build as buildWithVite } from 'vite'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const outputDirectory = path.join(projectRoot, 'dist')

await buildWithVite()

const assetDirectory = path.join(outputDirectory, 'assets')
const assets = await readdir(assetDirectory)
const stylesheet = assets.find((asset) => /^index-.*\.css$/.test(asset))

if (!stylesheet) {
  throw new Error('Vite did not emit the application stylesheet.')
}

await buildWithEsbuild({
  entryPoints: [path.join(projectRoot, 'src/standalone.tsx')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  minify: true,
  outfile: path.join(outputDirectory, 'app.js'),
})

await Promise.all(
  assets
    .filter((asset) => /^index-.*\.js$/.test(asset))
    .map((asset) => rm(path.join(assetDirectory, asset))),
)

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#f7f8fa">
    <meta name="description" content="KeepMovin college bus tracking demo for United College of Engineering & Research, Naini, Prayagraj.">
    <title>KeepMovin - College Bus Tracker</title>
    <link rel="stylesheet" href="./assets/${stylesheet}">
  </head>
  <body>
    <div id="root"></div>
    <script src="./app.js"></script>
  </body>
</html>
`

await writeFile(path.join(outputDirectory, 'index.html'), html, 'utf8')
console.log('Folder build ready: open dist\\index.html directly in Chrome.')
