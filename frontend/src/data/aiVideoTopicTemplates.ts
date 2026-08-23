export type TemplateSegment =
  | { type: 'text'; value: string }
  | { type: 'upload'; key: string; label: string }
  | { type: 'select'; key: string; options: string[]; defaultValue: string }

export interface AiVideoTopicTemplate {
  presetTitle: string
  segments: TemplateSegment[]
  defaults: Record<string, string>
}

export const AI_VIDEO_TOPIC_TEMPLATES: AiVideoTopicTemplate[] = [
  {
    presetTitle: '模特上身视频',
    segments: [
      { type: 'text', value: '上传' },
      { type: 'upload', key: 'asset', label: '商品图' },
      { type: 'text', value: '，生成' },
      {
        type: 'select',
        key: 'scene',
        options: ['模特上身', '穿搭展示', '走秀效果'],
        defaultValue: '模特上身',
      },
      { type: 'text', value: '应用平台为' },
      {
        type: 'select',
        key: 'platform',
        options: ['淘宝', '抖音', '小红书', '京东'],
        defaultValue: '淘宝',
      },
      { type: 'text', value: '，时长为' },
      {
        type: 'select',
        key: 'duration',
        options: ['5s', '10s', '15s', '30s'],
        defaultValue: '10s',
      },
      { type: 'text', value: '，比例为' },
      {
        type: 'select',
        key: 'ratio',
        options: ['9:16', '16:9', '1:1'],
        defaultValue: '9:16',
      },
    ],
    defaults: {
      asset: '商品图',
      scene: '模特上身',
      platform: '淘宝',
      duration: '10s',
      ratio: '9:16',
    },
  },
  {
    presetTitle: '产品展示',
    segments: [
      { type: 'text', value: '上传' },
      { type: 'upload', key: 'asset', label: '产品图' },
      { type: 'text', value: '，生成' },
      {
        type: 'select',
        key: 'scene',
        options: ['产品展示', '360度展示', '细节特写'],
        defaultValue: '产品展示',
      },
      { type: 'text', value: '，时长为' },
      {
        type: 'select',
        key: 'duration',
        options: ['5s', '10s', '15s', '30s'],
        defaultValue: '10s',
      },
      { type: 'text', value: '，比例为' },
      {
        type: 'select',
        key: 'ratio',
        options: ['9:16', '16:9', '1:1'],
        defaultValue: '9:16',
      },
    ],
    defaults: {
      asset: '产品图',
      scene: '产品展示',
      duration: '10s',
      ratio: '9:16',
    },
  },
  {
    presetTitle: 'TVC广告',
    segments: [
      { type: 'text', value: '上传' },
      { type: 'upload', key: 'asset', label: '产品图' },
      { type: 'text', value: '，生成' },
      {
        type: 'select',
        key: 'scene',
        options: ['TVC广告', '品牌宣传片', '氛围短片'],
        defaultValue: 'TVC广告',
      },
      { type: 'text', value: '，时长为' },
      {
        type: 'select',
        key: 'duration',
        options: ['10s', '15s', '30s', '60s'],
        defaultValue: '15s',
      },
      { type: 'text', value: '，比例为' },
      {
        type: 'select',
        key: 'ratio',
        options: ['16:9', '9:16', '1:1'],
        defaultValue: '16:9',
      },
    ],
    defaults: {
      asset: '产品图',
      scene: 'TVC广告',
      duration: '15s',
      ratio: '16:9',
    },
  },
]

export const VIDEO_STYLE_OPTIONS = ['通用风格', '电影感', '商业广告', '清新自然'] as const

export function findTemplateByPresetTitle(title: string) {
  return AI_VIDEO_TOPIC_TEMPLATES.find((item) => item.presetTitle === title)
}

export function buildTemplatePrompt(
  template: AiVideoTopicTemplate,
  values: Record<string, string>,
) {
  return template.segments
    .map((segment) => {
      if (segment.type === 'text') return segment.value
      if (segment.type === 'upload') return values[segment.key] ?? segment.label
      return values[segment.key] ?? segment.defaultValue
    })
    .join('')
}
