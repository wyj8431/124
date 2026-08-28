import type { VipTab } from '@/data/vipPageData'

export type MembershipProductId = 'template' | 'download' | 'all'

export interface MembershipProductPlan {
  planId: string
  tierCode: string
  annualPrice: number
  description: string
  highlights: string[]
}

export interface MembershipProduct {
  id: MembershipProductId
  name: string
  icon: 'template' | 'download' | 'crown'
  description: string
  recommended?: boolean
  plans: Record<VipTab, MembershipProductPlan>
  tools: { name: string; description: string; access: string }[]
  authorization: {
    summary: string
    allowed: string[]
    prohibited: string[]
    reminder: string
  }
}

/** 工单编号：网站学院-All poster低代码开发平台项目-订购会员任务工单 */
export const MEMBERSHIP_PRODUCTS: MembershipProduct[] = [
  {
    id: 'template',
    name: '模板会员',
    icon: 'template',
    description: '高频使用正版模板，快速完成日常设计',
    plans: {
      individual: {
        planId: 'basic',
        tierCode: 'basic',
        annualPrice: 149,
        description: '适合使用设计模板并用 AI 提效的个人创作者',
        highlights: ['海量 VIP 专享模板素材', '高清无水印下载', '个人商用授权'],
      },
      team: {
        planId: 'team-pro',
        tierCode: 'advanced',
        annualPrice: 299,
        description: '适合需要共享模板与团队协作的创作团队',
        highlights: ['团队共享模板', '20 人以内实时协作', '企业商用授权'],
      },
    },
    tools: [
      { name: 'AI 智能抠图', description: '在线快速移除图片背景，会员不限张使用。', access: '不限张' },
      { name: '历史记录查看', description: '保留设计版本和导出记录，便于随时找回。', access: '支持' },
      { name: '批量下载', description: '一次导出多份设计，适合日常内容发布。', access: '基础额度' },
    ],
    authorization: {
      summary: '模板会员包含 1 个个人商用授权，可用于已授权模板的常规内容创作。',
      allowed: ['社交媒体发帖', '企业宣传海报印刷', '线上活动与演示文档'],
      prohibited: ['单独售卖模板或素材', '将设计用于广告代投并转授权', '制作未经授权的衍生素材包'],
      reminder: '商用前请确认模板、字体、图片和音乐均处于当前会员授权范围内。',
    },
  },
  {
    id: 'download',
    name: '素材下载会员',
    icon: 'download',
    description: '更多下载额度与 AI 算力，适合稳定产出内容',
    plans: {
      individual: {
        planId: 'pro',
        tierCode: 'advanced',
        annualPrice: 399,
        description: '适合需要更高下载额度和 AI 辅助设计的个人用户',
        highlights: ['PSD 下载 3 次/天', 'AI 算力 1500 积分/月', '个人/企业商用授权'],
      },
      team: {
        planId: 'team-ultimate',
        tierCode: 'professional',
        annualPrice: 999,
        description: '适合需要稳定批量下载和团队内容生产的企业',
        highlights: ['PSD 下载 10 次/席位/天', '团队批量设计', '企业内容库管理'],
      },
    },
    tools: [
      { name: 'AI 智能抠图', description: '会员可不限张处理商品、人像与海报图片。', access: '不限张' },
      { name: '历史记录查看', description: '查看历史版本、导出记录和最近使用的素材。', access: '支持' },
      { name: '批量下载', description: '按项目批量导出图片、PDF、PPT 和 PSD。', access: '高额度' },
    ],
    authorization: {
      summary: '素材下载会员覆盖个人和企业内容生产，可在授权主体范围内用于商用设计。',
      allowed: ['社交媒体矩阵发布', '线下海报与活动物料', '企业内部演示与培训材料'],
      prohibited: ['将素材原文件单独售卖', '将下载内容作为素材库再分发', '超出授权主体范围转让使用权'],
      reminder: '批量下载不代表获得素材源文件的再分发权，交付客户时请保留授权记录。',
    },
  },
  {
    id: 'all',
    name: '大会员',
    icon: 'crown',
    description: '完整 AI Agent、商用授权与团队效率工具',
    recommended: true,
    plans: {
      individual: {
        planId: 'ultimate',
        tierCode: 'pro',
        annualPrice: 999,
        description: '适合追求创意效率与深度 AI Agent 能力的个人用户',
        highlights: ['AI 算力 3800 积分/月', 'PSD 下载 10 次/天', '个人/企业商用授权'],
      },
      team: {
        planId: 'team-supreme',
        tierCode: 'supreme',
        annualPrice: 1999,
        description: '适合高量 AI 生成与多人协作的深度创作团队',
        highlights: ['AI 算力 8000 积分/月/席位', '团队实时协作', '品牌与内容风险管控'],
      },
    },
    tools: [
      { name: 'AI 智能抠图', description: '不限张使用智能抠图并快速生成透明背景素材。', access: '不限张' },
      { name: '历史记录查看', description: '完整查看设计、版本和导出历史，支持快速恢复。', access: '完整' },
      { name: '批量下载', description: '批量套版并导出全套内容，提升高量生产效率。', access: '最高额度' },
    ],
    authorization: {
      summary: '大会员提供更完整的商用保障和内容风险管控，适合持续经营的品牌与团队。',
      allowed: ['品牌社媒与广告创意', '线上线下商业宣传物料', '企业内部及对外演示内容'],
      prohibited: ['售卖未做二次创作的模板素材', '以平台素材制作可再授权素材包', '规避平台审核或传播违法内容'],
      reminder: 'AI 生成内容仍需由使用者自行确认事实、版权和合规风险，平台授权不替代人工审核。',
    },
  },
]

export function getMembershipProduct(id: MembershipProductId) {
  return MEMBERSHIP_PRODUCTS.find((product) => product.id === id) ?? MEMBERSHIP_PRODUCTS[0]
}
