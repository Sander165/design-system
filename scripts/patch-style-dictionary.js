// Windows fix for style-dictionary's combineJSON.js.
//
// It calls globSync(pattern, { posix: true }). For absolute Windows patterns,
// glob's long-path escape comes back as `//?/C:/...` (forward slashes) instead
// of the native `\\?\C:\...`. Node's require()/module resolution doesn't
// recognize that form, misparses the leading `//` as a UNC path, and throws
// `EISDIR: illegal operation on a directory, lstat 'C:'`.
//
// Applied as a postinstall step (see package.json) instead of via
// patch-package because the corporate npm registry currently 502s on
// patch-package itself.
const fs = require('fs')
const path = require('path')

const targetFile = path.resolve(__dirname, '../node_modules/style-dictionary/lib/utils/combineJSON.js')

if (!fs.existsSync(targetFile)) {
  console.warn(`[patch-style-dictionary] ${targetFile} not found, skipping`)
  process.exit(0)
}

const original = fs.readFileSync(targetFile, 'utf8')
const marker = 'strip it before requiring the file'

if (original.includes(marker)) {
  process.exit(0)
}

const search = `    var resolvedPath = path.isAbsolute(files[i])
      ? files[i]
      : path.resolve(process.cwd(), files[i]);
    var file_content = null;`

const replacement = `    var resolvedPath = path.isAbsolute(files[i])
      ? files[i]
      : path.resolve(process.cwd(), files[i]);
    // On Windows, glob's \`posix: true\` option renders the long-path escape as
    // \`//?/C:/...\` (forward slashes) instead of the native \`\\\\?\\C:\\...\`. Node's
    // require()/fs resolution doesn't recognize that form and misparses the
    // leading \`//\` as a UNC path, so strip it before requiring the file.
    resolvedPath = resolvedPath.replace(/^[\\\\/]{2}\\?[\\\\/]/, "");
    var file_content = null;`

if (!original.includes(search)) {
  console.warn('[patch-style-dictionary] combineJSON.js has changed shape, skipping (fix may no longer be needed or needs updating)')
  process.exit(0)
}

fs.writeFileSync(targetFile, original.replace(search, replacement))
console.log('[patch-style-dictionary] applied Windows long-path fix to style-dictionary/lib/utils/combineJSON.js')
