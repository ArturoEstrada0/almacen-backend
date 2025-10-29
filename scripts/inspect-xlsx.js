#!/usr/bin/env node
// Simple XLSX inspector: prints sheet names and first N rows as JSON.
// Usage: node scripts/inspect-xlsx.js path/to/file.xlsx [sheetName] [rows]

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const file = process.argv[2]
const sheetArg = process.argv[3]
const rows = Number(process.argv[4] || 10)

if (!file) {
  console.error('Usage: node scripts/inspect-xlsx.js path/to/file.xlsx [sheetName] [rows]')
  process.exit(2)
}

const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file)

if (!fs.existsSync(abs)) {
  console.error('File not found:', abs)
  process.exit(2)
}

try {
  const wb = XLSX.readFile(abs, { cellDates: true })
  const sheetNames = wb.SheetNames
  console.log('Sheets:', sheetNames)

  const target = sheetArg || sheetNames[0]
  const ws = wb.Sheets[target]
  if (!ws) {
    console.error('Sheet not found:', target)
    process.exit(2)
  }

  const json = XLSX.utils.sheet_to_json(ws, { defval: null })
  console.log(`Preview of sheet "${target}" (${Math.min(rows, json.length)} rows):`)
  console.log(JSON.stringify(json.slice(0, rows), null, 2))
} catch (err) {
  console.error('Error reading xlsx:', err && err.message ? err.message : err)
  process.exit(1)
}
