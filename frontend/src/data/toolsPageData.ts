export interface ToolCardItem {
  title: string
  desc: string
  cover: string
  coverHover?: string
}

export interface ToolSection {
  title: string
  items: ToolCardItem[]
}

export interface EditorPickItem {
  title: string
  cover: string
}

export const TOOLS_PAGE_BANNER =
  'https://eyuankupub-cdn-oss.chuangkit.com/teach/www/banner-bg.png'

export const TOOLS_EDITOR_PICK: EditorPickItem[] = [
  {
    title: '商品套图',
    cover:
      'https://pub-cdn-oss.chuangkit.com/ad_position/31acfdddcfce4405ad540372e9233b2f',
  },
  {
    title: '模特手持图',
    cover:
      'https://pub-cdn-oss.chuangkit.com/ad_position/7b595cc822c049978f23eea2d0dcb8ea',
  },
  {
    title: '商品精修图',
    cover:
      'https://pub-cdn-oss.chuangkit.com/ad_position/334e3e0b24444f32a9a586e616acf974',
  },
  {
    title: '商品卖点图',
    cover:
      'https://pub-cdn-oss.chuangkit.com/ad_position/9a3b16662e074094b36e86056ae60004',
  },
]

export const TOOLS_SECTIONS: ToolSection[] = [
  {
    title: 'AI 商品图',
    items: [
      { title: 'A+详情图', desc: '智能商品详情长图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/e944a899574b489eb63272f00de342bb' },
      { title: '电商套图', desc: '电商商品营销套图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/ce61ed882db9490882b560124f5ae438' },
      { title: '一键白底图', desc: '批量生成白底图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/f4428f08d8364b44acd56386f41bfb4f' },
      { title: '一键细节图', desc: '细节放大突出质感', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/0989734dbc194fd78a08115962e58668' },
      { title: '一键场景图', desc: '场景合成提升氛围', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/68adc70097e84915b90a49a6d0235587' },
      { title: '一键卖点图', desc: '卖点提炼视觉表达', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/87818f4ead3d4432b90ca635181f3799' },
      { title: '买家秀', desc: '清晰种草图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/9064eb6d56ae4a13a5d1535bdb25e6d4' },
      { title: '三视图', desc: '多角度展示细节', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/392901ff074a441aab8a348e635ba3a6' },
      { title: '图片翻译', desc: '一键翻译目标语言', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/bd40b708229b4586a5c287ade80397ad' },
      { title: '产品精修', desc: '智能精修，质感升级', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/0e998b0c237a44b3b4a86639ad3d1b4e' },
    ],
  },
  {
    title: 'AI 模特图',
    items: [
      { title: '模特试穿图', desc: '直观看效果', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/3453a5726bdf432e87cbf993438a14c5' },
      { title: '商品上身穿戴', desc: '万物可试戴', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/a8c0c6c07f794da6814f9c2a08f9a69b' },
      { title: '模特手持商品', desc: '手持商品，真实互动', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/4e8c8ca962fe4e4eba3777d3795c9743' },
      { title: '更换模特', desc: '一键更换模特', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/fbe69fce9a7e4e59a04962dd4e466370' },
      { title: 'AI人台模特', desc: '根据需求自由切换', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/913595eff0074d788d8cfdd6678b4d01' },
    ],
  },
  {
    title: 'AI 视频',
    items: [
      { title: '爆款视频复刻', desc: '视频带货，即时转化', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/4920bd840f71405f874c9a7b2dd2ccaa' },
      { title: 'AI图生视频', desc: '产品效果更立体', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/d04d982049f546fa916c7caad76e1a48' },
      { title: '商品主图视频', desc: '多角度展示产品', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/f5cb344f39c444d9bc8845a2721b25b8' },
    ],
  },
  {
    title: 'POD印花',
    items: [
      { title: '图片裁剪', desc: '尺寸自定义', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/e780ddcc45d64263bdf2279a4d1b348a' },
      { title: '印花提取', desc: '一键提取图案', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/fb082975cc414508b1b09c81fd724133' },
      { title: '印花裂变', desc: '丰富图案，一键还原', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/98332dd0fad54d60822c37709e2efbe5' },
      { title: '局部改图', desc: '保持整体，调整细节', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/fd0459b07fb048b3ae52d29a0390eaf4' },
    ],
  },
  {
    title: 'AI工具',
    items: [
      { title: 'AI创作', desc: '智能生成创意设计', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/cb8cc5346c93400689c962662fb51cb6' },
      { title: '智能设计', desc: '智能排版高效出图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/c15faa0526aa469eb887f22411a3350f' },
      { title: '文生素材', desc: '文字驱动素材生成', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/2887a1e9f3254e988ca23735b68ff418' },
      { title: '图生图', desc: '参考图片创意延展', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/e301ebb604ce4931bae2d177777f0f57' },
      { title: '批量设计', desc: '批量生成统一视觉', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/d76632e5cd2b476c8d54100a5d411536' },
      { title: 'AI文案', desc: '智能生成营销文案', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/5cac558bbc9e4712abd498aef3e5d312' },
      { title: '姿势识别', desc: '精准识别人物姿', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/30ff7d0d7455477fb563867b54563674' },
      { title: '文生背景', desc: '文字生成场景背景', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/f66385094a90441b9391c65397cdf5bb' },
      { title: 'AI logo', desc: '智能生成品牌标识', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/d412f871f79c4f30882e9f78b66c3be2' },
    ],
  },
  {
    title: '图片处理',
    items: [
      { title: '图片编辑', desc: '图片编辑，秒出佳作', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/101886d939bb4598ac838d7f14452f43' },
      { title: 'AI抠图', desc: '智能抠图，一键分离', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/032f7cfa83514ddfa62ef22ec44f771f' },
      { title: 'AI消除', desc: '智能消除，抹去杂物', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/a8d0ed7b59404e6f8853ba058f5c53d5' },
      { title: '图片变清晰', desc: '一键修复，高清焕现', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/8a38d56fc3a94bf3a83754f43a7ae582' },
      { title: 'AI扩图', desc: '一键扩图，延伸美景', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/783f7e4ff219436495c77c9766e56247' },
      { title: '局部重绘', desc: '局部重绘，精准修改', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/29b181bf449543ebb60709e09cccd10f' },
      { title: '无损改尺寸', desc: '调整尺寸，画质无损', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/8268ad230a714b00a7d34f2f2840b26a' },
      { title: 'AI拼图', desc: '智能拼图，轻松排版', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/2068eba04f034acb9294dbe8c1001234' },
      { title: 'AI去水印', desc: '一键去水印', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/b5e3a5acd26c4c76ab686c1af15d5417' },
      { title: '图片转设计', desc: '识图生设计', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/d1a12d3ef28c44ebbbb7dd00fddc30a5' },
      { title: '图片翻译', desc: '图片翻译，一键识别', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/6fd9767563504d158d97f442e0407980' },
      { title: '图片批处理', desc: '批量出图，省时省力', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/94b378f5b1114ee086e8c6939f93b700' },
    ],
  },
]

export const TOOLS_SMART_DESIGN_SECTION: ToolSection = {
  title: '智能设计',
  items: [
    { title: '商品主图', desc: '智能出图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/1f67fd3dd35144fc9ac7f067d184648e' },
    { title: '小红书大字封面', desc: '一键获得爆款封面', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/f987142cd8ea4db4807eed7a9cc9c4fe' },
    { title: '备忘录内页', desc: '封面内页，详细出图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/0451216f77544c0fafaf490572075e9d' },
    { title: '每日一签', desc: '每日都是上上签', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/329fd7fe34234f5bbfca481decbcb63a' },
    { title: '公众号首图', desc: '热点速递，醒目吸睛', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/4c88b0d7ae204211bce620942a61fecf' },
    { title: '小红书表情封面', desc: '表情封面，流量爆款', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/d39953a77440441c9f54c61863acc651' },
    { title: '公众号次图', desc: '一键生成精美配图', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/40b85ed5603749a69fdc827801a911a0' },
    { title: '横版海报', desc: 'AI速出横版海报', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/f624bda106e44f65b98e1e8068ea6b44' },
    { title: '招聘海报', desc: '智能出图，广纳英才', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/67af26d07fad47a4b5a04f67149fc60a' },
    { title: '招生海报', desc: 'AI速出招生海报', cover: 'https://pub-cdn-oss.chuangkit.com/ad_position/78b6daec210945d992ded030613d37b9' },
  ],
}

/** 卡片缩放：273px 列宽 / 231px 原始 frame 宽 */
export const TOOL_CARD_SCALE = 273 / 231
