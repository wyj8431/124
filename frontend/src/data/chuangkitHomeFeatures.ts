import type { HomeFeature } from '@/types'

type LinkType = HomeFeature['linkType']

function feature(
  id: number,
  tabCode: string,
  title: string,
  subtitle: string,
  image: string,
  linkValue: string,
  linkType: LinkType = 'ai_tool',
): HomeFeature {
  return {
    id,
    title,
    subtitle,
    coverUrl: `/home-features/${image}.webp`,
    linkType,
    linkValue,
    tabCode,
  }
}

export const chuangkitHomeFeatures: Record<string, HomeFeature[]> = {
  hot: [
    feature(90_001, 'hot', '热点日历', '一览全年热点', 'hot-calendar', '/calendar', 'url'),
    feature(90_002, 'hot', '智能抠图', '一键抠图', 'hot-matting', 'matting'),
    feature(90_003, 'hot', 'AI爆款视频', '一键生成带货视频', 'hot-video', 'ai_video'),
    feature(90_004, 'hot', 'AI海报/封面', '一键生成营销海报', 'hot-poster', 'ai_poster'),
    feature(90_005, 'hot', '电商套图', '一键生成爆款套图', 'hot-ecommerce', 'ecommerce_set'),
    feature(90_006, 'hot', 'AI去水印', '无痕去水印', 'hot-watermark', 'remove_watermark'),
    feature(90_007, 'hot', '印刷定制', '点击即可快速开始', 'hot-print', 'business_card', 'scene'),
    feature(90_008, 'hot', '招生特辑', '全场景模板', 'hot-enroll', 'education', 'template_category'),
  ],
  ai_ecommerce: [
    feature(90_101, 'ai_ecommerce', '商品场景图', '增强代入感促下单', 'ecom-scene', 'ecommerce_set'),
    feature(90_102, 'ai_ecommerce', '高级感A+图', '全方位展示细节', 'ecom-aplus', 'ecommerce_set'),
    feature(90_103, 'ai_ecommerce', '批量白底图', '完整展示产品全貌', 'ecom-white', 'ecommerce_set'),
    feature(90_104, 'ai_ecommerce', '一键营销主图', '爆款主图', 'ecom-main', 'ecommerce_set'),
    feature(90_105, 'ai_ecommerce', '产品精修', '精修质感', 'ecom-retouch', 'ecommerce_set'),
    feature(90_106, 'ai_ecommerce', '产品卖点图', '提炼产品卖点', 'ecom-selling', 'ecommerce_set'),
    feature(90_107, 'ai_ecommerce', '商品换背景', '一键切换精美背景', 'ecom-background', 'ecommerce_set'),
    feature(90_108, 'ai_ecommerce', '图片翻译', '跨境改文案', 'ecom-translate', 'ecommerce_set'),
  ],
  model_wear: [
    feature(90_201, 'model_wear', 'AI真人模特', '快速出图', 'model-real', 'ai_draw'),
    feature(90_202, 'model_wear', '模特试穿', '上身直观感受', 'model-tryon', 'ai_draw'),
    feature(90_203, 'model_wear', '万物穿戴', '一键上身', 'model-wear', 'ai_draw'),
    feature(90_204, 'model_wear', '人台模特', '一览上身效果', 'model-mannequin', 'ai_draw'),
    feature(90_205, 'model_wear', '模特更换', '点击即可快速开始', 'model-change', 'ai_draw'),
    feature(90_206, 'model_wear', '模特多角度', '360度展示', 'model-angle', 'ai_draw'),
  ],
  video: [
    feature(90_301, 'video', '视频变清晰', '改善模糊感', 'video-enhance', 'ai_video'),
    feature(90_302, 'video', '视频去水印', '去除多余元素', 'video-watermark', 'ai_video'),
    feature(90_303, 'video', 'TVC广告大片', '秒出品牌大片', 'video-tvc', 'ai_video'),
    feature(90_304, 'video', '图生视频', '传图生视频', 'video-image', 'ai_video'),
    feature(90_305, 'video', '主图视频', '视频展示主图', 'video-main', 'ai_video'),
    feature(90_306, 'video', '爆款视频', '一键生成带货视频', 'video-popular', 'ai_video'),
  ],
  pod: [
    feature(90_401, 'pod', 'POD印花提取', '高清提取细节', 'pod-extract', 'ai_draw'),
    feature(90_402, 'pod', 'POD印花裂变', '一图变多图', 'pod-variation', 'ai_draw'),
    feature(90_403, 'pod', 'POD图片裁剪', '自动裁剪', 'pod-crop', 'ai_draw'),
    feature(90_404, 'pod', '局部改图', '修改指定区域', 'pod-edit', 'ai_draw'),
  ],
  image_process: [
    feature(90_501, 'image_process', 'AI文生图', '点击即可快速开始', 'image-text', 'ai_draw'),
    feature(90_502, 'image_process', '图转设计', '传图秒转设计', 'image-design', 'ai_poster'),
    feature(90_503, 'image_process', '局部重绘', '智能调整局部', 'image-redraw', 'ai_draw'),
    feature(90_504, 'image_process', '图片变清晰', '提亮模糊原图', 'image-enhance', 'enhance'),
    feature(90_505, 'image_process', 'AI扩图', '智能延展画面', 'image-expand', 'ai_draw'),
    feature(90_506, 'image_process', 'AI消除', '去除画面多余杂物', 'image-erase', 'remove_watermark'),
    feature(90_507, 'image_process', 'AI抠图', '一键智能抠图', 'image-matting', 'matting'),
    feature(90_508, 'image_process', '图片批量处理', '批量处理多张图片', 'image-batch', 'ai_draw'),
  ],
  print: [
    feature(90_601, 'print', '线下活动物料', '一键生成物料、一键下单制作', 'print-offline', 'business_card', 'scene'),
    feature(90_602, 'print', '次日达专区', '工作日15点前下单，次日生产交付', 'print-next-day', 'business_card', 'scene'),
    feature(90_603, 'print', '印刷稿件模板', '免费免水印使用', 'print-template', 'business_card', 'scene'),
    feature(90_604, 'print', '3D打印手办', '免费生图，一键下单实物', 'print-3d', 'business_card', 'scene'),
    feature(90_605, 'print', '企业宣传物料', '线下物料印刷制作', 'print-company', 'business_card', 'scene'),
    feature(90_606, 'print', '粉丝应援', '应援物料周边制作', 'print-fan', 'business_card', 'scene'),
    feature(90_607, 'print', '文创周边', '创意文创周边设计模板', 'print-cultural', 'business_card', 'scene'),
  ],
}

export function getChuangkitHomeFeatures(tabCode: string) {
  return chuangkitHomeFeatures[tabCode] ?? []
}
