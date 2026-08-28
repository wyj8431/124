export const SHAPE_KINDS = ['rect', 'triangle', 'circle', 'pill', 'corner', 'sparkle']

export const editorTextQuickPresets = [
  { id: 'headline', label: '标题', content: '标题文字', fontSize: 42, fontWeight: 700 },
  { id: 'subheading', label: '副标题', content: '副标题文字', fontSize: 28, fontWeight: 600 },
  { id: 'body', label: '正文', content: '正文内容', fontSize: 22, fontWeight: 400 },
  { id: 'vertical', label: '竖排文字', content: '竖\n排\n文\n字', fontSize: 34, fontWeight: 600, width: 72, height: 220 },
  { id: 'effect', label: '特效文字', content: '特效文字', fontSize: 46, fontWeight: 800 },
]

export const editorAddPanelSections = [
  {
    id: 'media',
    title: '图片/视频',
    moreAction: { type: 'tool', tool: 'image' },
    cards: [
      { id: 'local-upload', label: '本地上传', icon: 'Upload', action: { type: 'upload' } },
      { id: 'mobile-upload', label: '手机上传', icon: 'Smartphone', action: { type: 'upload' } },
    ],
  },
  {
    id: 'text',
    title: '文字',
    moreAction: { type: 'tool', tool: 'text' },
    cards: editorTextQuickPresets.map((preset) => ({
      id: preset.id,
      label: preset.label,
      icon: 'Type',
      action: { type: 'text', presetId: preset.id },
    })),
  },
  {
    id: 'shapes',
    title: '形状',
    moreAction: { type: 'tool', tool: 'components' },
    cards: [
      { id: 'rect', label: '矩形', icon: 'Square', action: { type: 'shape', shape: 'rect' } },
      { id: 'triangle', label: '三角形', icon: 'Triangle', action: { type: 'shape', shape: 'triangle' } },
      { id: 'circle', label: '圆形', icon: 'Circle', action: { type: 'shape', shape: 'circle' } },
      { id: 'pill', label: '圆角矩形', icon: 'Pill', action: { type: 'shape', shape: 'pill' } },
      { id: 'corner', label: '直角三角形', icon: 'CornerDownRight', action: { type: 'shape', shape: 'corner' } },
      { id: 'sparkle', label: '星形', icon: 'Sparkles', action: { type: 'shape', shape: 'sparkle' } },
    ],
  },
  {
    id: 'components',
    title: '组件',
    moreAction: { type: 'tool', tool: 'components' },
    cards: [
      { id: 'chart', label: '图表', icon: 'ChartNoAxesColumnIncreasing', action: { type: 'tool', tool: 'components' } },
      { id: 'legend', label: '图例', icon: 'Orbit', action: { type: 'tool', tool: 'components' } },
      { id: 'table', label: '表格', icon: 'Table2', action: { type: 'tool', tool: 'components' } },
      { id: 'qrcode', label: '二维码', icon: 'QrCode', action: { type: 'tool', tool: 'components' } },
    ],
  },
  {
    id: 'tools',
    title: '工具',
    moreAction: { type: 'tool', tool: 'ai' },
    cards: [
      { id: 'smart-design', label: '智能设计', icon: 'WandSparkles', action: { type: 'tool', tool: 'ai' } },
      { id: 'size-extend', label: '尺寸延展', icon: 'Expand', action: { type: 'canvas' } },
      { id: 'import-file', label: '导入文件', icon: 'Import', action: { type: 'upload' } },
      { id: 'batch-design', label: '批量设计', icon: 'CopyPlus', action: { type: 'tool', tool: 'templates' } },
      { id: 'ai-image', label: 'AI生图', icon: 'Languages', action: { type: 'tool', tool: 'ai' } },
      { id: 'ai-copy', label: 'AI文案', icon: 'PenLine', action: { type: 'tool', tool: 'ai' } },
      { id: 'more-ai', label: '更多AI', icon: 'Bot', action: { type: 'tool', tool: 'ai' } },
    ],
  },
]

function fillPolygon(context, points) {
  context.beginPath()
  context.moveTo(...points[0])
  points.slice(1).forEach((point) => context.lineTo(...point))
  context.closePath()
  context.fill()
}

export function drawShape(context, shape, x, y, width, height) {
  if (shape === 'rect') {
    context.fillRect(x, y, width, height)
    return
  }

  if (shape === 'circle') {
    context.beginPath()
    context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
    context.fill()
    return
  }

  if (shape === 'pill') {
    context.beginPath()
    context.roundRect(x, y, width, height, Math.min(width, height) / 2)
    context.fill()
    return
  }

  if (shape === 'triangle') {
    fillPolygon(context, [[x + width / 2, y], [x + width, y + height], [x, y + height]])
    return
  }

  if (shape === 'corner') {
    fillPolygon(context, [[x, y], [x + width, y], [x + width, y + height]])
    return
  }

  if (shape === 'sparkle') {
    fillPolygon(context, [
      [x + width / 2, y], [x + width * 0.63, y + height * 0.37], [x + width, y + height / 2], [x + width * 0.63, y + height * 0.63],
      [x + width / 2, y + height], [x + width * 0.37, y + height * 0.63], [x, y + height / 2], [x + width * 0.37, y + height * 0.37],
    ])
    return
  }

  context.fillRect(x, y, width, height)
}
