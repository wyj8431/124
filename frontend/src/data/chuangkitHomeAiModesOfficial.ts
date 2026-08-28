import type { HomeSection, HomeSectionCard } from '@/types'
import {
  AI_VIDEO_INSPIRATION_MEDIA,
  getAiVideoInspirationMediaKey,
} from '@/data/aiVideoInspirationMedia'

export type OfficialHomeAiMode = 'agent' | 'image_gen' | 'video_gen'
export type OfficialHomeAiSectionGroup = OfficialHomeAiMode

type InspirationCard = {
  title: string
  coverUrl: string
}

function officialSection(
  id: number,
  code: string,
  title: string,
  subtitle: string,
  cards: InspirationCard[],
): HomeSection {
  return {
    id,
    code,
    title,
    subtitle,
    templates: [],
    cards: cards.map<HomeSectionCard>((card, index) => ({
      id: id * 100 + index,
      label: card.title,
      templateId: id * 100 + index,
      title: card.title,
      coverUrl: card.coverUrl,
      videoUrl:
        code === 'official-short-drama'
          ? AI_VIDEO_INSPIRATION_MEDIA[getAiVideoInspirationMediaKey('短剧带货', index)]?.video
          : undefined,
      width: 400,
      height: 640,
      isFree: 1,
    })),
  }
}

// Captured from https://www.chuangkit.com/designtools/designindex on 2026-08-25.
const AGENT_SECTIONS = [
  officialSection(9811, 'official-xiaohongshu', '小红书封面', '官网热门 AI 创作灵感', [
    { title: '猫咪行为科普小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/63ac3cbe-eaa5-4bfb-a0a8-9236bcb344c7?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '职场干货小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/3af37889-5bc8-4ddc-bde9-d987de9647e6?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '排版设计教学小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/572568ca-fd06-44f2-805f-27fad19653ba?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '互联网运营干货小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8d79ff21-649b-41cb-a31e-02b9dc292889?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '自媒体标题干货小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8a880494-5b46-472a-963a-65713fa54645?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '科学育儿干货小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/875ee589-6e1a-416e-86ff-3a49e1a0efb2?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '育儿讨论小红书封面', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/33d24f6d-b9c5-4da2-bc9f-8132a6739547?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
  ]),
  officialSection(9812, 'official-marketing', '营销海报', '官网热门 AI 创作灵感', [
    { title: '3D黏土软陶风少儿英语启蒙招生海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/5c584750-37a2-43db-9b22-c31c90ce05ae?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '线圈笔记本手绘风少儿托管招生海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/c8ba872c-947a-476f-be7b-5e3065499b0c?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '卡通涂鸦拼贴风招聘海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/873ad4f8-e5c6-405d-b59d-a80175e5039e?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '复古手账拼贴风招聘海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/10/5f12db05-8ccc-4a2c-93b3-8940af54791b?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '极简高级ins风618开门红促销海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/aacdf4c9-e2a0-45c8-a032-d943a0be7318?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '渐变红高端立体618促销海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/ca05359c-aaf6-4bdb-ad74-b66d4a50aadd?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '卡通手绘超级会员日促销海报', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/c723e6f1-e86e-4c60-b731-21527ab4e026?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
  ]),
]

const IMAGE_SECTIONS = [
  officialSection(9821, 'official-amazon', '亚马逊套图', '官网热门 AI 图片创作灵感', [
    { title: '细节拆解图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/4ff4b0b0-efce-4b68-a081-1c9cc5c13e4a?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '核心卖点 + 效果对比图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/f1fff379-b14e-4593-9947-1b434274c712?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '健康喂食姿势对比图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/25d16ea4-c132-4a48-bae6-341a93be87e2?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '多场景适用图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/28/fe2169c1-d91f-4d95-b4b4-e44c2e05cd06?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '尺寸指南图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/28/5f777802-a1ae-4be8-871f-1b00f778fc66?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '产品细节拆解图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/28/e3033462-f1f5-4c26-9811-5f55660e2b2c?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '产品细节拆解图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/28/7e952d80-5c44-4da2-a4c4-d47150fc536c?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
  ]),
  officialSection(9822, 'official-product-detail', '商品详情页', '官网热门 AI 图片创作灵感', [
    { title: '沐浴露详情页', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/24/f06c05bc-173b-4e2f-b45f-d56bb2c4c3d9?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '燕窝-电商详情页', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/21/88e51c7f-2ae9-41ae-bee8-6b437ec1283a?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '防晒衣-电商详情页', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/21/afc3c09d-8248-411b-9afb-0b31fc1091ae?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '面膜-产品详情图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/23/430a9de4-84ce-4c06-b348-e3b763a283dc?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '宠物鲜粮配比-参数详情页', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/29/a562066a-870e-4f13-bd1f-9bfca96f08de?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '防晒伞详情页', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/24/baf84d65-1f79-4fa8-99f7-c622f301ef52?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '手持风扇-电商详情图', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/04/22/b57b63ac-1286-46b9-a6d5-3ecbc5beae46?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
  ]),
]

const VIDEO_SECTIONS = [
  officialSection(9831, 'official-short-drama', '短剧带货', '官网热门 AI 视频创作灵感', [
    { title: '酒水', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/beae53aa-9937-41ca-b8b1-4dfb5512db34?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '气垫', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/bec2536f-af40-4d56-b8a5-27bfb04fe25d?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '溜溜梅', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/96408d41-4648-45e2-9d5a-528023eebc89?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '溜溜梅创意脚本', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/c31d4b0e-24c4-4c28-b66a-9f00025a0953?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '面霜', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/77426a6b-687a-4db8-931b-ddcba1d00890?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '黑绷带', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/209b7c1b-fbb9-4d04-b632-951be0d3c771?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
    { title: '精华', coverUrl: 'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/05/27/ea530d3b-a009-4e8f-8695-c1760ba03681?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35' },
  ]),
]

const OFFICIAL_HOME_AI_SECTION_GROUPS: Record<OfficialHomeAiSectionGroup, HomeSection[]> = {
  agent: AGENT_SECTIONS,
  image_gen: IMAGE_SECTIONS,
  video_gen: VIDEO_SECTIONS,
}

export const OFFICIAL_HOME_AI_MODE_SECTION_CODES: Record<
  OfficialHomeAiMode,
  OfficialHomeAiSectionGroup[]
> = {
  agent: ['agent', 'image_gen', 'video_gen'],
  image_gen: ['image_gen', 'agent', 'video_gen'],
  video_gen: ['video_gen', 'agent', 'image_gen'],
}

const resolveOfficialHomeAiModeSections = (groups: OfficialHomeAiSectionGroup[]) =>
  groups.flatMap((group) => OFFICIAL_HOME_AI_SECTION_GROUPS[group])

export const OFFICIAL_HOME_AI_MODE_SECTIONS: Record<OfficialHomeAiMode, HomeSection[]> = {
  agent: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.agent),
  image_gen: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.image_gen),
  video_gen: resolveOfficialHomeAiModeSections(OFFICIAL_HOME_AI_MODE_SECTION_CODES.video_gen),
}
