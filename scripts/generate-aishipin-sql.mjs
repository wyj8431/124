import fs from 'fs'

const raw = fs.readFileSync(
  'C:/Users/74352/.cursor/projects/c-Users-74352-Desktop/agent-tools/aead033f-2a9e-469f-b135-d66cb2dba9d1.txt',
  'utf8',
)
const line = raw.split('\n').find((l) => l.startsWith('"['))
if (!line) throw new Error('JSON line not found')
const sections = JSON.parse(JSON.parse(line))

function esc(value) {
  return (value || '').replace(/'/g, "''")
}

function posterUrl(poster) {
  if (!poster) return ''
  if (poster.includes('imageMogr2')) return poster
  return `${poster}?imageMogr2/thumbnail/400x>/format/webp/cgif/35`
}

let sql = ''
for (const section of sections) {
  sql += `\n-- ${section.section}\n`
  sql +=
    'INSERT INTO ai_topic_inspiration (section_id, title, cover_url, cover_hover_url, prompt_text, sort_order, status) VALUES\n'
  const rows = section.cards.map((card, index) => {
    const prompt = `生成${card.title}${section.section}视频`
    return `((SELECT id FROM ai_topic_section WHERE page_code='aishipin' AND title='${esc(section.section)}'), '${esc(card.title)}', '${esc(posterUrl(card.poster))}', '${esc(card.videoUrl)}', '${esc(prompt)}', ${index + 1}, 1)`
  })
  sql += `${rows.join(',\n')};\n`
}

const outPath = 'C:/Users/74352/Desktop/创客贴/backend/src/main/resources/db/aishipin-inspiration.sql'
const tsPath = 'C:/Users/74352/Desktop/创客贴/frontend/src/data/aiVideoInspirationMedia.ts'
fs.writeFileSync(outPath, sql)

const mediaEntries = []
for (const section of sections) {
  section.cards.forEach((card, index) => {
    mediaEntries.push({
      key: `${section.section}::${index}`,
      poster: posterUrl(card.poster),
      video: card.videoUrl,
    })
  })
}

const ts = `// Auto-generated from official Chuangkit aishipin page. Run scripts/generate-aishipin-sql.mjs to refresh.
export type AiVideoInspirationMediaEntry = { poster?: string; video?: string }

export function getAiVideoInspirationMediaKey(sectionTitle: string, cardIndex: number) {
  return \`\${sectionTitle}::\${cardIndex}\`
}

export const AI_VIDEO_INSPIRATION_MEDIA: Record<string, AiVideoInspirationMediaEntry> = {
${mediaEntries
  .map(
    (entry) =>
      `  '${entry.key.replace(/'/g, "\\'")}': {\n    poster: '${entry.poster.replace(/'/g, "\\'")}',\n    video:\n      '${entry.video.replace(/'/g, "\\'")}',\n  },`,
  )
  .join('\n')}
}
`
fs.writeFileSync(tsPath, ts)

console.log(
  `Generated ${outPath}: ${sections.length} sections, ${sections.reduce((n, s) => n + s.cards.length, 0)} cards`,
)
