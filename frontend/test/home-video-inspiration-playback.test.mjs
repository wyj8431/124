import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const homeDataUrl = new URL('../src/data/chuangkitHomeAiModesOfficial.ts', import.meta.url)
const mediaDataUrl = new URL('../src/data/aiVideoInspirationMedia.ts', import.meta.url)
const homePageUrl = new URL('../src/pages/HomePage.tsx', import.meta.url)
const topicSectionUrl = new URL('../src/components/home/TopicScrollSection.tsx', import.meta.url)
const detailModalUrl = new URL('../src/components/ai-topic/AiCreationDetailModal.tsx', import.meta.url)
const stylesheetUrl = new URL('../src/index.css', import.meta.url)

function transpileCommonJs(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
}

async function loadOfficialHomeVideoData() {
  const mediaOutput = transpileCommonJs(await readFile(mediaDataUrl, 'utf8'))
  const mediaModule = { exports: {} }
  new Function('exports', 'module', mediaOutput)(mediaModule.exports, mediaModule)

  const homeOutput = transpileCommonJs(await readFile(homeDataUrl, 'utf8'))
  const homeModule = { exports: {} }
  new Function('exports', 'module', 'require', homeOutput)(
    homeModule.exports,
    homeModule,
    (specifier) => {
      if (specifier === '@/data/aiVideoInspirationMedia') return mediaModule.exports
      throw new Error(`Unexpected module dependency: ${specifier}`)
    },
  )
  return { home: homeModule.exports, media: mediaModule.exports }
}

test('official short-drama homepage cards carry their signed MP4 sources', async () => {
  const { home, media } = await loadOfficialHomeVideoData()
  const shortDrama = home.OFFICIAL_HOME_AI_MODE_SECTIONS.video_gen.find(
    (section) => section.code === 'official-short-drama',
  )

  assert.ok(shortDrama)
  assert.ok(shortDrama.cards.length > 0)
  shortDrama.cards.forEach((card, index) => {
    const expected = media.AI_VIDEO_INSPIRATION_MEDIA[`短剧带货::${index}`]?.video
    assert.equal(card.videoUrl, expected)
    assert.match(card.videoUrl, /^https:\/\/.+\.mp4\?sign=/)
  })
})

test('homepage video cards route to the existing detail player while image cards retain template clicks', async () => {
  const [homePage, topicSection] = await Promise.all([
    readFile(homePageUrl, 'utf8'),
    readFile(topicSectionUrl, 'utf8'),
  ])

  assert.match(homePage, /AiCreationDetailModal/)
  assert.match(homePage, /selectedVideoCard/)
  assert.match(homePage, /onCardClick=\{handleHomepageCardClick\}/)
  assert.match(homePage, /context=\{homepageVideoDetailContext\}/)
  assert.match(homePage, /showControls/)

  assert.match(topicSection, /onCardClick\?: \(card: HomeSectionCard, index: number\) => void/)
  assert.match(topicSection, /card\.videoUrl/)
  assert.match(topicSection, /<video/)
  assert.match(topicSection, /topic-card__play-badge/)
  assert.match(topicSection, /<Play/)
  assert.match(topicSection, /onCardClick\?\.\(card, index\)/)
  assert.match(topicSection, /onTemplateClick\?\.\(toTemplate\(card\)\)/)
})

test('homepage video cards use a seven-column portrait frame and preserve the entire video', async () => {
  const [topicSection, stylesheet] = await Promise.all([
    readFile(topicSectionUrl, 'utf8'),
    readFile(stylesheetUrl, 'utf8'),
  ])

  assert.match(topicSection, /topic-section--video/)
  assert.match(topicSection, /topic-card__poster--video/)
  assert.match(topicSection, /topic-card__media--video/)
  assert.match(stylesheet, /\.topic-section--video \.topic-section__scroll \{\s*grid-template-columns: repeat\(7, minmax\(0, 1fr\)\);/)
  assert.match(stylesheet, /\.topic-card__poster--video \{\s*aspect-ratio: 9 \/ 16;/)
  assert.match(stylesheet, /\.topic-card__media--video \{\s*object-fit: contain;/)
})

test('homepage video cards reserve visible space for their labels below the portrait frame', async () => {
  const [topicSection, stylesheet] = await Promise.all([
    readFile(topicSectionUrl, 'utf8'),
    readFile(stylesheetUrl, 'utf8'),
  ])

  assert.match(topicSection, /<div className="topic-card__label">\{card\.label\}<\/div>/)
  assert.match(stylesheet, /\.topic-section--video \.topic-card__label \{\s*display: block;\s*min-height: 32px;/)
  assert.match(stylesheet, /\.topic-section--video \.topic-section__scroll \{[\s\S]*?overflow: visible;/)
})

test('homepage video detail playback exposes native controls', async () => {
  const detailModal = await readFile(detailModalUrl, 'utf8')

  assert.match(detailModal, /showControls = false/)
  assert.match(detailModal, /controls=\{showControls\}/)
})
