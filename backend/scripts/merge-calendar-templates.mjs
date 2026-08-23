import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '../src/main/resources/db/data.sql')
const extraPath = path.join(__dirname, '../src/main/resources/db/calendar_event_templates.sql')
const goodPath = path.join(__dirname, '../target/classes/db/data.sql')

// Restore from compiled copy if source was corrupted
if (fs.existsSync(goodPath)) {
  fs.copyFileSync(goodPath, dataPath)
}

let data = fs.readFileSync(dataPath, 'utf8')
const extra = fs.readFileSync(extraPath, 'utf8').trim()

const oldEnd =
  "('七夕商场横版促销海报', 'https://picsum.photos/seed/qixi-h-02/400/226', 16, 2, 1920, 1080, '{\"version\":\"1.0\",\"layers\":[]}', '七夕,横版', 1250, 1, 0, 1);"

if (!data.includes(oldEnd)) {
  throw new Error('Could not find qixi-h-02 insert anchor in data.sql')
}

data = data.replace(oldEnd, `${oldEnd.slice(0, -1)},\n${extra};`)
fs.writeFileSync(dataPath, data, 'utf8')
console.log('merged into data.sql')
