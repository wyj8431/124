export type AiTemplateSceneCode =
  | 'product_detail'
  | 'model_wear'
  | 'retouch'
  | 'video'
  | 'ecommerce'

export interface AiTemplateScene {
  code: AiTemplateSceneCode
  name: string
  icon: string
  tags?: string[]
}

export interface AiTemplateGalleryItem {
  id: number
  title: string
  prompt: string
  image: string
  ratio: string
  isVideo?: boolean
}

const image = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=760&q=84`

const productImages = [
  '1523275335684-37898b6baf30',
  '1542291026-7eec264c27ff',
  '1503602642458-232111445657',
  '1556228578-0d85b1a4d571',
  '1560472354-b33ff0c44a43',
  '1505740420928-5e560c06d30e',
  '1526170375885-4d8ecf77b99f',
  '1547887538-e3a2f32cb1cc',
  '1586495777744-4413f21062fa',
  '1556228453-efd6c1ff04f6',
  '1522337360788-8b13dee7a37e',
  '1556909212-d5b604d0c90d',
  '1572635196237-14b3f281503f',
  '1511556820780-d912e42b4980',
  '1542291026-7eec264c27ff',
  '1526170375885-4d8ecf77b99f',
  '1523275335684-37898b6baf30',
  '1560472354-b33ff0c44a43',
]

const modelImages = [
  '1515886657613-9f3515b0c78f',
  '1524504388940-b1c1722653e1',
  '1483985988355-763728e1935b',
  '1496747611176-843222e1e57c',
  '1488426862026-3ee34a7d66df',
  '1517841905240-472988babdf9',
  '1519085360753-af0119f7cbe7',
  '1490481651871-ab68de25d43d',
  '1509631179647-0177331693ae',
  '1521572163474-6864f9cf17ab',
  '1524250502761-1ac6f2e30d43',
  '1544005313-94ddf0286df2',
  '1485968579580-b6d095142e6e',
  '1539109136881-3be0616acf4b',
  '1485230895905-ec40ba36b9bc',
  '1525507119028-ed4c629a60a3',
  '1487412720507-e7ab37603c6f',
  '1502823403499-6ccfcf4fb453',
]

const retouchImages = [
  '1522337360788-8b13dee7a37e',
  '1535585209827-a15fcdbc4c2d',
  '1556228453-efd6c1ff04f6',
  '1523275335684-37898b6baf30',
  '1556228578-0d85b1a4d571',
  '1556909212-d5b604d0c90d',
  '1560472354-b33ff0c44a43',
  '1511556820780-d912e42b4980',
  '1547887538-e3a2f32cb1cc',
  '1542291026-7eec264c27ff',
  '1586495777744-4413f21062fa',
  '1503602642458-232111445657',
  '1526170375885-4d8ecf77b99f',
  '1572635196237-14b3f281503f',
  '1523275335684-37898b6baf30',
  '1556228453-efd6c1ff04f6',
]

const videoImages = [
  '1515886657613-9f3515b0c78f',
  '1542291026-7eec264c27ff',
  '1524504388940-b1c1722653e1',
  '1526170375885-4d8ecf77b99f',
  '1503602642458-232111445657',
  '1522337360788-8b13dee7a37e',
  '1547887538-e3a2f32cb1cc',
  '1523275335684-37898b6baf30',
  '1496747611176-843222e1e57c',
  '1556228578-0d85b1a4d571',
  '1517841905240-472988babdf9',
  '1535585209827-a15fcdbc4c2d',
  '1521572163474-6864f9cf17ab',
  '1556909212-d5b604d0c90d',
  '1511556820780-d912e42b4980',
  '1509631179647-0177331693ae',
]

const ecommerceImages = [
  '1556228453-efd6c1ff04f6',
  '1523275335684-37898b6baf30',
  '1556909212-d5b604d0c90d',
  '1511556820780-d912e42b4980',
  '1547887538-e3a2f32cb1cc',
  '1560472354-b33ff0c44a43',
  '1522337360788-8b13dee7a37e',
  '1526170375885-4d8ecf77b99f',
  '1556228578-0d85b1a4d571',
  '1542291026-7eec264c27ff',
  '1586495777744-4413f21062fa',
  '1535585209827-a15fcdbc4c2d',
  '1503602642458-232111445657',
  '1572635196237-14b3f281503f',
  '1523275335684-37898b6baf30',
  '1556228453-efd6c1ff04f6',
  '1556909212-d5b604d0c90d',
  '1511556820780-d912e42b4980',
]

const ratios = ['4 / 5', '3 / 4', '1 / 1', '4 / 5', '3 / 4', '9 / 10', '4 / 5', '1 / 1']

function buildItems(
  startId: number,
  subject: string,
  ids: string[],
  isVideo = false,
): AiTemplateGalleryItem[] {
  return ids.map((id, index) => ({
    id: startId + index,
    title: `${subject}${index + 1}`,
    prompt: `为${subject}生成自然光、高质感、商业可用的 AI 视觉方案`,
    image: image(id),
    ratio: ratios[index % ratios.length],
    isVideo,
  }))
}

export const AI_TEMPLATE_SCENES: AiTemplateScene[] = [
  { code: 'product_detail', name: '商品详情页', icon: '🔥' },
  { code: 'model_wear', name: '模特上身图', icon: '👤' },
  { code: 'retouch', name: '商品精修套图', icon: '🛍️' },
  { code: 'video', name: 'AI视频', icon: '🎬' },
  { code: 'ecommerce', name: '电商营销图', icon: '💰', tags: ['全部', '直播背景图', '商品卖点广告图', '商品主图'] },
]

export const AI_TEMPLATE_GALLERIES: Record<AiTemplateSceneCode, AiTemplateGalleryItem[]> = {
  product_detail: buildItems(41_001, '商品详情页视觉', productImages),
  model_wear: buildItems(42_001, '模特上身展示', modelImages),
  retouch: buildItems(43_001, '商品精修套图', retouchImages),
  video: buildItems(44_001, 'AI 视频分镜', videoImages, true),
  ecommerce: buildItems(45_001, '电商营销视觉', ecommerceImages),
}
