#!/usr/bin/env node
// Convert inventory XLSX to normalized JSON suitable for import.
// Usage: node scripts/convert-inventory.js path/to/file.xlsx [sheetName]

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const file = process.argv[2]
const sheetArg = process.argv[3]

if (!file) {
  console.error('Usage: node scripts/convert-inventory.js path/to/file.xlsx [sheetName]')
  process.exit(2)
}

const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
if (!fs.existsSync(abs)) {
  console.error('File not found:', abs)
  process.exit(2)
}

const wb = XLSX.readFile(abs, { cellDates: true })
const sheetNames = wb.SheetNames
const target = sheetArg || sheetNames[0]
const ws = wb.Sheets[target]
if (!ws) {
  console.error('Sheet not found:', target)
  process.exit(2)
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })
if (!rows || rows.length === 0) {
  console.error('No rows found')
  process.exit(2)
}

// Find header row: first row that contains non-empty strings and likely header labels
let headerRowIndex = 0
for (let i = 0; i < Math.min(5, rows.length); i++) {
  const r = rows[i]
  const nonEmpty = r.filter(c => c !== null && c !== undefined && String(c).trim() !== '')
  if (nonEmpty.length >= 3) { headerRowIndex = i; break }
}

const rawHeader = rows[headerRowIndex].map(h => (h === null ? '' : String(h).trim()))

// If header row contains repeated labels in first row (like 'CODIGO DEL PRODUCTO' in cell A)
// but actual header labels are in that row's values, we normalize known names.
const header = rawHeader.map(h => {
  return h
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .trim()
})

// Map header to normalized keys
// Heuristics: look for keywords
function normalizeKey(h) {
  const s = (h || '').toLowerCase()
  if (s.includes('codigo') || s.includes('producto')) return 'code'
  if (s.includes('descripcion') || s.includes('descripcion')) return 'description'
  if (s.includes('existencia') || s.includes('inicial')) return 'initial'
  if (s.includes('entradas')) return 'in'
  if (s.includes('salida') || s.includes('salidas')) return 'out'
  if (s.includes('stock')) return 'stock'
  if (s.includes('cajas') && !s.includes('pt')) return 'boxes'
  if (s.includes('pt') || s.includes('pt.')) return 'boxes_pt'
  return s.replace(/[^a-z0-9]/g, '_') || null
}

const keys = header.map(normalizeKey)

const data = []
for (let i = headerRowIndex + 1; i < rows.length; i++) {
  const r = rows[i]
  if (!r || r.length === 0) continue
  const item = {}
  let hasValue = false
  for (let j = 0; j < Math.max(keys.length, r.length); j++) {
    const k = keys[j]
    const v = r[j]
    if (k) {
      item[k] = v
      if (v !== null && v !== undefined && String(v).trim() !== '') hasValue = true
    }
  }
  if (hasValue) data.push(item)
}

// Ensure output directory
const outDir = path.join(process.cwd(), 'data', 'imports')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
const base = path.basename(file, path.extname(file)).replace(/\s+/g, '-')
const outFile = path.join(outDir, `${base}.json`)
fs.writeFileSync(outFile, JSON.stringify(data, null, 2))
console.log(`Wrote ${data.length} rows to ${outFile}`)
