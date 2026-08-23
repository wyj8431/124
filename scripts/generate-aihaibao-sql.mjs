import fs from 'fs'

const sections = [
  {
    title: '小红书封面',
    items: [
      ['猫咪行为科普小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/63ac3cbe-eaa5-4bfb-a0a8-9236bcb344c7?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['职场干货小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/3af37889-5bc8-4ddc-bde9-d987de9647e6?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['排版设计教学小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/572568ca-fd06-44f2-805f-27fad19653ba?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['互联网运营干货小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8d79ff21-649b-41cb-a31e-02b9dc292889?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['自媒体标题干货小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8a880494-5b46-472a-963a-65713fa54645?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['科学育儿干货小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/875ee589-6e1a-416e-86ff-3a49e1a0efb2?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['育儿讨论小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/33d24f6d-b9c5-4da2-bc9f-8132a6739547?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['护肤避坑小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/ed2931b1-f7e0-4398-b305-dfe86cf00687?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['克服三分钟热度自律小红书封面', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/d2a38af9-7977-4ea1-b3f6-ca4fc7d7a011?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
    ],
  },
  {
    title: '营销海报',
    items: [
      ['3D黏土软陶风少儿英语启蒙招生海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/5c584750-37a2-43db-9b22-c31c90ce05ae?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['线圈笔记本手绘风少儿托管招生海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/c8ba872c-947a-476f-be7b-5e3065499b0c?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['卡通涂鸦拼贴风招聘海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/873ad4f8-e5c6-405d-b59d-a80175e5039e?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['复古手账拼贴风招聘海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/10/5f12db05-8ccc-4a2c-93b3-8940af54791b?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['极简高级ins风618开门红促销海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/aacdf4c9-e2a0-45c8-a032-d943a0be7318?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['渐变红高端立体618促销海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/ca05359c-aaf6-4bdb-ad74-b66d4a50aadd?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['卡通手绘超级会员日促销海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/c723e6f1-e86e-4c60-b731-21527ab4e026?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['台球俱乐部充值活动海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/dd6a4265-0e1b-4ca1-9345-2794a8970403?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
      ['简约扁平手绘风促销企划海报', 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/7efb1b2a-e20a-4ab6-a448-28e960413970?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35'],
    ],
  },
]

function esc(value) {
  return (value || '').replace(/'/g, "''")
}

let sql = ''
const mediaEntries = []

for (const section of sections) {
  sql += `\n-- ${section.title}\n`
  sql +=
    'INSERT INTO ai_topic_inspiration (section_id, title, cover_url, cover_hover_url, prompt_text, sort_order, status) VALUES\n'
  const rows = section.items.map(([title, img], index) => {
    mediaEntries.push({ key: `${section.title}::${index}`, poster: img })
    return `((SELECT id FROM ai_topic_section WHERE page_code='AIhaibao' AND title='${esc(section.title)}'), '${esc(title)}', '${esc(img)}', NULL, '${esc(`生成${title}`)}', ${index + 1}, 1)`
  })
  sql += `${rows.join(',\n')};\n`
}

const sqlPath = 'C:/Users/74352/Desktop/创客贴/backend/src/main/resources/db/aihaibao-inspiration.sql'
const tsPath = 'C:/Users/74352/Desktop/创客贴/frontend/src/data/aiPosterInspirationMedia.ts'

fs.writeFileSync(sqlPath, sql)

const ts = `export function getAiPosterInspirationMediaKey(sectionTitle: string, cardIndex: number) {
  return \`\${sectionTitle}::\${cardIndex}\`
}

export const AI_POSTER_INSPIRATION_MEDIA: Record<string, { poster?: string }> = {
${mediaEntries
  .map(
    (entry) =>
      `  '${entry.key.replace(/'/g, "\\'")}': { poster: '${entry.poster.replace(/'/g, "\\'")}' },`,
  )
  .join('\n')}
}
`
fs.writeFileSync(tsPath, ts)
console.log(`Generated ${mediaEntries.length} cards`)
