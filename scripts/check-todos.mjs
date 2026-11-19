// Definition of Done (docs/PROMPT_MAESTRO.md §14): no pending-work markers without an owner.
// The accepted form carries a name in parentheses, e.g. `TODO(owner)`.
// Usage: node scripts/check-todos.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, extname, join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['src', 'tests', 'scripts', 'supabase', '.github']
const SCAN_FILES = [
  'next.config.ts',
  'eslint.config.mjs',
  'commitlint.config.mjs',
  'vitest.config.mts',
  'vitest.setup.ts',
  'playwright.config.ts',
]
const EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.mjs', '.js', '.css', '.sql', '.toml', '.yml'])
const SKIP_DIRS = new Set(['node_modules', '.next'])
const SELF = basename(import.meta.url)
const ORPHAN = /\bTODO\b(?!\([\w.-]+\))/

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const path = join(dir, entry)
    const info = statSync(path)
    if (info.isDirectory()) yield* walk(path)
    else if (EXTENSIONS.has(extname(path)) && basename(path) !== SELF) yield path
  }
}

const files = [
  ...SCAN_DIRS.flatMap((dir) => {
    try {
      return [...walk(join(ROOT, dir))]
    } catch {
      return []
    }
  }),
  ...SCAN_FILES.map((file) => join(ROOT, file)),
]

const offenders = []
for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  text.split('\n').forEach((line, index) => {
    if (ORPHAN.test(line)) offenders.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`)
  })
}

if (offenders.length > 0) {
  console.error('Pending-work markers without an owner (use TODO(owner)):')
  for (const offender of offenders) console.error(`  ${offender}`)
  process.exit(1)
}
console.log(`check-todos: ${files.length} files scanned, no orphan markers.`)
