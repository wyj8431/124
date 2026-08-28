import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const dataModuleUrl = new URL('../src/data/chuangkitHomeAiModesOfficial.ts', import.meta.url)
const mediaDataModuleUrl = new URL('../src/data/aiVideoInspirationMedia.ts', import.meta.url)
const homePageUrl = new URL('../src/pages/HomePage.tsx', import.meta.url)

async function loadVideoInspirationMedia() {
  const source = await readFile(mediaDataModuleUrl, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  new Function('exports', 'module', output)(module.exports, module)
  return module.exports
}

async function loadAiModeData() {
  const [source, media] = await Promise.all([
    readFile(dataModuleUrl, 'utf8'),
    loadVideoInspirationMedia(),
  ])
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  new Function('exports', 'module', 'require', output)(module.exports, module, (specifier) => {
    if (specifier === '@/data/aiVideoInspirationMedia') return media
    throw new Error(`Unexpected module dependency: ${specifier}`)
  })
  return module.exports
}

test('AI mode sections expose every approved five-section order', async () => {
  const { OFFICIAL_HOME_AI_MODE_SECTION_CODES, OFFICIAL_HOME_AI_MODE_SECTIONS } = await loadAiModeData()

  assert.deepEqual(OFFICIAL_HOME_AI_MODE_SECTION_CODES, {
    agent: ['agent', 'image_gen', 'video_gen'],
    image_gen: ['image_gen', 'agent', 'video_gen'],
    video_gen: ['video_gen', 'agent', 'image_gen'],
  })

  assert.deepEqual(
    Object.fromEntries(Object.entries(OFFICIAL_HOME_AI_MODE_SECTIONS).map(([mode, sections]) => [
      mode,
      sections.map((section) => section.code),
    ])),
    {
      agent: [
        'official-xiaohongshu',
        'official-marketing',
        'official-amazon',
        'official-product-detail',
        'official-short-drama',
      ],
      image_gen: [
        'official-amazon',
        'official-product-detail',
        'official-xiaohongshu',
        'official-marketing',
        'official-short-drama',
      ],
      video_gen: [
        'official-short-drama',
        'official-xiaohongshu',
        'official-marketing',
        'official-amazon',
        'official-product-detail',
      ],
    },
  )
})

test('homepage reads the selected AI mode and renders supplied sections', async () => {
  const source = await readFile(homePageUrl, 'utf8')

  assert.match(source, /onModeChange=\{handleHomeModeChange\}/)
  assert.match(source, /OFFICIAL_HOME_AI_MODE_SECTIONS\[activeHomeMode as OfficialHomeAiMode\]/)
  assert.match(source, /isAiHomeMode \? \([\s\S]*officialAiModeSections\.map\(/)
  assert.match(source, /section=\{section\}/)
})
