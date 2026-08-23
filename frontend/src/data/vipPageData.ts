export type VipTab = 'individual' | 'team'

export interface VipBenefitItem {
  label: string
  badge?: string
}

export interface VipBenefitGroup {
  title: string
  items: VipBenefitItem[]
}

export interface VipPlan {
  id: string
  name: string
  subtitle: string
  price?: string
  priceUnit?: string
  priceDesc: string[]
  buttonText: string
  buttonVariant: 'free' | 'primary' | 'enterprise'
  benefits: VipBenefitGroup[]
}

export type VipCompareCell = string | 'check' | 'dash'

export interface VipCompareTable {
  sectionTitle?: string
  rows: { label: string; subLabel?: string; cells: VipCompareCell[] }[]
}

export const INDIVIDUAL_PLANS: VipPlan[] = [
  {
    id: 'free',
    name: '免费版',
    subtitle: '适用于个人体验学习使用',
    price: '0',
    priceUnit: '/ 月',
    priceDesc: ['AI算力50积分/日', '（当日有效，且注册用户不再额外赠送积分）'],
    buttonText: '免费体验',
    buttonVariant: 'free',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片模型' },
          { label: '生成后不可去除品牌水印' },
          { label: '智能抠图（设计页内）1张' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '无商用授权保障' },
          { label: '享有免费版的全部功能' },
          { label: '3GB 云存储空间' },
        ],
      },
    ],
  },
  {
    id: 'basic',
    name: '基础版',
    subtitle: '适合使用设计模板并用AI提效的使用者',
    price: '8',
    priceUnit: '/ 月 起',
    priceDesc: ['AI算力600积分/月', '约生成60～150张图（终身版会员积分另行提供）'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '个人商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 3次/天', badge: '限时加赠' },
          { label: '60GB 云存储空间' },
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: '高级版',
    subtitle: '适合AI辅助设计的高级AI Agent使用者',
    price: '23',
    priceUnit: '/ 月 起',
    priceDesc: ['AI算力1500积分/月', '约生成150～375张图'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '个人/企业商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 3次/天', badge: '限时加赠' },
          { label: '批量设计，设计更高效' },
          { label: '100GB 云存储空间' },
        ],
      },
    ],
  },
  {
    id: 'ultimate',
    name: '专业版',
    subtitle: '适合追求创意高效的深度AI Agent使用者',
    price: '83',
    priceUnit: '/ 月 起',
    priceDesc: ['AI算力3800积分/月', '约生成380～950张图'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '个人/企业商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 10次/天', badge: '限时加赠' },
          { label: '批量设计，设计更高效' },
          { label: '200GB 云存储空间' },
        ],
      },
    ],
  },
]

export const TEAM_PLANS: VipPlan[] = [
  {
    id: 'team-pro',
    name: '高级版',
    subtitle: '适合AI辅助设计的高级AI Agent使用团队',
    price: '21',
    priceUnit: '/ 月 / 席位 起',
    priceDesc: ['AI算力1500积分/月/席位', '约生成150～375张图'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '企业商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 10次/席位/天' },
          { label: '批量设计，设计更高效' },
          { label: '600GB/团队 云存储空间' },
        ],
      },
      {
        title: '团队/企业管理权益',
        items: [
          { label: '支持20人以内实时协作/批注/评论' },
          { label: '品牌LOGO/ 字体等在线管理应用' },
          { label: '团队空间自定义标签和分类' },
          { label: '便捷成员管理、离职交接' },
          { label: '设计数据可视化分析汇总' },
        ],
      },
    ],
  },
  {
    id: 'team-ultimate',
    name: '专业版',
    subtitle: '适合追求创意高效的深度AI Agent使用团队',
    price: '83',
    priceUnit: '/ 月 / 席位 起',
    priceDesc: ['AI算力3800积分/月/席位', '约生成380～950张图'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '企业商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 10次/席位/天' },
          { label: '批量设计，设计更高效' },
          { label: '800GB/团队 云存储空间' },
        ],
      },
      {
        title: '团队/企业管理权益',
        items: [
          { label: '支持20人以内实时协作/批注/评论' },
          { label: '品牌LOGO/ 字体等在线管理应用' },
          { label: '团队空间自定义标签和分类' },
          { label: '便捷成员管理、离职交接' },
          { label: '设计数据可视化分析汇总' },
        ],
      },
    ],
  },
  {
    id: 'team-supreme',
    name: '至尊版',
    subtitle: '适合高量AI生成的资深AI Agent使用团队',
    price: '166',
    priceUnit: '/ 月 / 席位 起',
    priceDesc: ['AI算力8000积分/月/席位', '约生成800～2000张图'],
    buttonText: '立即开通',
    buttonVariant: 'primary',
    benefits: [
      {
        title: 'Agent算力工具权益',
        items: [
          { label: '支持所有图片&视频模型' },
          { label: '生成作品去除品牌水印' },
          { label: '不限张智能抠图' },
        ],
      },
      {
        title: '内容创作权益',
        items: [
          { label: '企业商用授权*1' },
          { label: '高清无水印下载' },
          { label: '海量VIP专享模板素材' },
          { label: '平面/PPT/H5视频零门槛下载' },
          { label: 'PSD下载 10次/席位/天' },
          { label: '批量设计，设计更高效' },
          { label: '1000GB/团队 云存储空间' },
        ],
      },
      {
        title: '团队/企业管理权益',
        items: [
          { label: '支持20人以内实时协作/批注/评论' },
          { label: '品牌LOGO/ 字体等在线管理应用' },
          { label: '团队空间自定义标签和分类' },
          { label: '便捷成员管理、离职交接' },
          { label: '设计数据可视化分析汇总' },
        ],
      },
    ],
  },
  {
    id: 'enterprise',
    name: '大企业定制',
    subtitle: '适合于大型企业（跨地域/多分、子公司的企业）适合大量AI生成的资深AI Agent团队',
    priceDesc: [],
    buttonText: '立即咨询',
    buttonVariant: 'enterprise',
    benefits: [
      {
        title: '拥有【团队版】所有权益，额外',
        items: [
          { label: '账号数量可定制' },
          { label: 'AI Agent Skills自定义配置（即将开放）' },
          { label: '内容审批管理，确保安全合规' },
          { label: '自定义企业Logo、导航、域名、主题' },
          { label: '敏感词检测，安全合规' },
          { label: '多品牌管理，自定义Logo、品牌色、品牌字体' },
          { label: '企业微信、企业自有系统接入' },
          { label: '1V1专属服务团队' },
        ],
      },
    ],
  },
]

export const INDIVIDUAL_COMPARE: VipCompareTable[] = [
  {
    rows: [
      { label: '价格', cells: ['免费使用', '¥8 / 月 起', '¥23 / 月 起', '¥83 / 月 起'] },
      { label: '起购人数', cells: ['dash', '1 人', '1 人', '1 人'] },
      { label: '可购人数上限', cells: ['dash', '1 人', '1 人', '1 人'] },
      {
        label: '授权类型',
        cells: ['仅限个人学习交流', '个人商用授权*1', '个人/企业商用授权 *1个', '个人/企业商用授权 *1个'],
      },
    ],
  },
  {
    sectionTitle: 'Agent算力工具权益',
    rows: [
      {
        label: '月赠送积分量',
        cells: [
          'AI算力 50积分/日 （当日有效，且注册用户不再额外赠送积分）',
          'AI算力 600积分/月 约生成60～150张图 终身版会员积分另行提供',
          'AI算力 1500积分/月 约生成150～375张图',
          'AI算力 3800积分/月 约生成380～950张图',
        ],
      },
      {
        label: '可用模型范围',
        cells: ['支持所有图片模型', '支持所有图片&视频模型', '支持所有图片&视频模型', '支持所有图片&视频模型'],
      },
      {
        label: '是否可去除作品品牌水印',
        cells: ['生成后不可去除品牌水印', '生成作品去除品牌水印', '生成作品去除品牌水印', '生成作品去除品牌水印'],
      },
      {
        label: '智能抠图（会员免费）',
        cells: [
          '智能抠图（设计页内）1张',
          '不限张智能抠图限时免费',
          '不限张智能抠图限时免费',
          '不限张智能抠图限时免费',
        ],
      },
    ],
  },
  {
    sectionTitle: '内容使用权益',
    rows: [
      { label: '创客贴公益内容', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的精美平面模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的丰富演示文档模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的创意视频模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的高级H5模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的素材/字体/音乐等', cells: ['check', 'check', 'check', 'check'] },
      { label: '建立企业自有内容库', cells: ['dash', '1 个', '1 个', '1 个'] },
      { label: '定制/采购企业专属内容', subLabel: '(需另付费)', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '内容编辑能力',
    rows: [
      { label: '强大平面智能编辑器在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '强大的PPT智能零门槛在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '强大的视频动效智能编辑器在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '高清无水印导出PDF、JPG和PNG文件', cells: ['check', 'check', 'check', 'check'] },
      { label: '设计PSD格式下载（网页端）', cells: ['dash', '3次/天', '3次/天', '10次/天'] },
      { label: '导出可供打印的设计或以CMYK格式导出设计', cells: ['check', 'check', 'check', 'check'] },
      { label: '内置社交媒体分享和演示文档模式', cells: ['check', 'check', 'check', 'check'] },
      { label: '创作具有自定义尺寸设计', cells: ['check', 'check', 'check', 'check'] },
      { label: '基于企业品牌模板创作', cells: ['check', 'check', 'check', 'check'] },
      { label: '批量套版设计', cells: ['check', 'check', 'check', 'check'] },
      { label: '智能尺寸变化', cells: ['check', 'check', 'check', 'check'] },
      { label: '导入psd生成设计', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '团队共享协作',
    rows: [
      { label: '多人实时协作编辑（团队内部分享）', cells: ['check', 'check', 'check', 'check'] },
      { label: '多人共享团队素材', cells: ['check', 'check', 'check', 'check'] },
      { label: '多人共享团队模板', cells: ['团队限免', '团队限免', '团队限免', '团队限免'] },
      { label: '团队空间文件夹', cells: ['团队限免', '团队限免', '团队限免', '团队限免'] },
      { label: '多人在线批注/评论', cells: ['check', 'check', 'check', 'check'] },
      { label: 'PSD/AI等文件转成在线模板复用', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '内容风险管控',
    rows: [
      { label: '正版内容商用保障，作品永久授权', subLabel: '(AI作品除外)', cells: ['check', 'check', 'check', 'check'] },
      { label: '品牌管理', subLabel: 'LOGO/字体/色号等在线管理应用', cells: ['check', 'check', 'check', 'check'] },
      { label: '内容审批工作流', subLabel: '未经审核作品可设置不可下载', cells: ['check', 'check', 'check', 'check'] },
      { label: '品牌内容应用管制', cells: ['check', 'check', 'check', 'check'] },
      { label: '敏感词检测', subLabel: '(广告法等)', cells: ['check', 'check', 'check', 'check'] },
      { label: '内容使用管控，智能风险检测', cells: ['check', 'check', 'check', 'check'] },
      { label: '只允许团队内部访问的链接', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '内容存储管理',
    rows: [
      { label: '存储空间', cells: ['3GB', '60GB', '100GB', '200GB'] },
      { label: '扩展包购买', cells: ['dash', 'check', 'check', 'check'] },
      { label: '多企业内容库管理与权限控制', cells: ['dash', 'check', 'check', 'check'] },
    ],
  },
]

export const TEAM_COMPARE: VipCompareTable[] = [
  {
    rows: [
      { label: '价格', cells: ['¥21 / 月 / 席位 起', '¥83 / 月 / 席位 起', '¥166 / 月 / 席位 起', '联系商务'] },
      { label: '起购人数', cells: ['2 人', '2 人', '2 人', '20 人'] },
      { label: '可购人数上限', cells: ['20 人', '20 人', '20 人', '10000 人'] },
      {
        label: '授权类型',
        cells: [
          '企业商用授权*1个（可加购）',
          '企业商用授权*1个（可加购）',
          '企业商用授权*1个（可加购）',
          '企业商用授权*1个（可加购）',
        ],
      },
    ],
  },
  {
    sectionTitle: 'Agent算力工具权益',
    rows: [
      {
        label: '月赠送积分量',
        cells: [
          'AI算力 1500积分/月 约生成150～375张图',
          'AI算力 3800积分/月 约生成380～950张图',
          'AI算力 8000积分/月 约生成800～2000张图',
          'AI算力可定制',
        ],
      },
      {
        label: '可用模型范围',
        cells: ['支持所有图片&视频模型', '支持所有图片&视频模型', '支持所有图片&视频模型', '支持所有图片&视频模型'],
      },
      {
        label: '是否可去除作品品牌水印',
        cells: ['生成作品去除品牌水印', '生成作品去除品牌水印', '生成作品去除品牌水印', '生成作品去除品牌水印'],
      },
      {
        label: '智能抠图（会员免费）',
        cells: ['不限张智能抠图限时免费', '不限张智能抠图限时免费', '不限张智能抠图限时免费', '不限张智能抠图限时免费'],
      },
    ],
  },
  {
    sectionTitle: '内容使用权益',
    rows: [
      { label: '创客贴公益内容', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的精美平面模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的丰富演示文档模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的创意视频模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的高级H5模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '正版可商用的素材/字体/音乐等', cells: ['check', 'check', 'check', 'check'] },
      { label: '建立企业自有内容库', cells: ['3 个', '3 个', '3 个', '可定制'] },
      { label: '定制/采购企业专属内容', subLabel: '(需另付费)', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '内容编辑能力',
    rows: [
      { label: '强大平面智能编辑器在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '强大的PPT智能零门槛在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '强大的视频动效智能编辑器在线使用', cells: ['check', 'check', 'check', 'check'] },
      { label: '高清无水印导出PDF、JPG和PNG文件', cells: ['check', 'check', 'check', 'check'] },
      { label: '设计PSD格式下载（网页端）', cells: ['10次/席位/天', '10次/席位/天', '10次/席位/天', '可定制'] },
      { label: '批量套版设计', cells: ['check', 'check', 'check', 'check'] },
      { label: '智能尺寸变化', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '团队共享协作',
    rows: [
      { label: '多人实时协作编辑（团队内部分享）', cells: ['check', 'check', 'check', 'check'] },
      { label: '多人共享团队素材', cells: ['check', 'check', 'check', 'check'] },
      { label: '多人共享团队模板', cells: ['check', 'check', 'check', 'check'] },
      { label: '团队空间文件夹', cells: ['check', 'check', 'check', 'check'] },
      { label: '多人在线批注/评论', cells: ['check', 'check', 'check', 'check'] },
      { label: 'PSD/AI等文件转成在线模板复用', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
  {
    sectionTitle: '内容存储管理',
    rows: [
      { label: '存储空间', cells: ['600GB/团队', '800GB/团队', '1000GB/团队', '可定制'] },
      { label: '扩展包购买', cells: ['check', 'check', 'check', 'check'] },
    ],
  },
]

export function getPlansByTab(tab: VipTab) {
  return tab === 'individual' ? INDIVIDUAL_PLANS : TEAM_PLANS
}

export function getCompareByTab(tab: VipTab) {
  return tab === 'individual' ? INDIVIDUAL_COMPARE : TEAM_COMPARE
}

export function planLinkToTab(linkUrl?: string): VipTab {
  if (!linkUrl) return 'individual'
  return linkUrl.includes('team') || linkUrl.includes('enterprise') ? 'team' : 'individual'
}

export function planLinkToId(linkUrl?: string): string | undefined {
  if (!linkUrl) return undefined
  const slug = linkUrl.replace(/^\/vip\//, '')
  const map: Record<string, string> = {
    basic: 'basic',
    pro: 'pro',
    ultimate: 'ultimate',
    'team-pro': 'team-pro',
    'team-ultimate': 'team-ultimate',
    'team-supreme': 'team-supreme',
    enterprise: 'enterprise',
  }
  return map[slug]
}
