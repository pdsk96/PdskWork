# Plan to Fix Build Failure in PdskWork

## Verified Status
- TypeScript compiles clean: `npx tsc --noEmit` → 0 errors
- No TS2322 or TS2783 errors exist in any TS/TSX files
- Only error is in prebuild hook: `scripts/add-insights.mjs` throws `TypeError: Cannot read properties of undefined (reading 'catch')`

## Root Cause
`scripts/add-insights.mjs:47` — `function main()` is synchronous:
- Uses `fs.readFileSync()` (line 48) and `fs.writeFileSync()` (line 62)
- Returns `void` / `undefined`
- Line 66 calls `main().catch(...)` — but `undefined` has no `.catch` method → TypeError

The script succeeds at runtime (prints "added insight to 0 post(s)") but the `.catch()` call on its non-Promise return value crashes the build.

## Fix
File: `scripts/add-insights.mjs`

1. Change `const raw = fs.readFileSync(BLOG_JSON, 'utf8')` → `const raw = await fs.promises.readFile(BLOG_JSON, 'utf8')`
2. Change `fs.writeFileSync(BLOG_JSON, JSON.stringify(posts, null, 2))` → `await fs.promises.writeFile(BLOG_JSON, JSON.stringify(posts, null, 2))`
3. Change `function main()` → `async function main()`
4. Keep import `import fs from 'node:fs'` (supports `fs.promises` API)

## Validation Steps
1. Run `node scripts/add-insights.mjs` directly — must complete without TypeError
2. Run `npm run build` — must pass prebuild and complete static export
3. Confirm 104 blog posts in output and all routes `● (SSG)`
