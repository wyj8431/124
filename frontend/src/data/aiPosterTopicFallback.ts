import type { AiTopicIndexData } from '@/types/aiTopic'

/** 官网 AI 海报页兜底数据（后端未就绪时使用） */
export const AI_POSTER_TOPIC_FALLBACK: AiTopicIndexData = {
  code: 'AIhaibao',
  title: 'AI海报',
  breadcrumbParent: 'AI创作',
  breadcrumbParentUrl: '/tools',
  promptPlaceholder: '上传参考图片，描述下您需要的内容，我们会为您呈现~',
  generateButtonText: '生成',
  presets: [
    {
      id: 1,
      title: '小红书大字封面',
      coverUrl: 'https://pub-cdn-oss.chuangkit.com/ad_position/469a0b5d55c046649075e10c965d52c5',
      promptText: '生成小红书大字封面风格的海报，突出标题信息与视觉冲击力',
      cardRotateDeg: -5,
      cardOffsetX: 55,
      cardZIndex: 1,
    },
    {
      id: 2,
      title: '小红书人物封面',
      coverUrl: 'https://pub-cdn-oss.chuangkit.com/ad_position/1f500d8afbf7430283f3330155cb81c7',
      promptText: '生成小红书人物封面风格的海报，突出人物主体与氛围感',
      cardRotateDeg: 3,
      cardOffsetX: 149,
      cardZIndex: 2,
    },
    {
      id: 3,
      title: '招聘海报',
      coverUrl: 'https://pub-cdn-oss.chuangkit.com/ad_position/70b0fb96f56d418fbdaf2dce44d675e3',
      promptText: '生成招聘主题海报，突出岗位信息与品牌调性',
      cardRotateDeg: -5,
      cardOffsetX: 259,
      cardZIndex: 3,
    },
    {
      id: 4,
      title: '招生海报',
      coverUrl: 'https://pub-cdn-oss.chuangkit.com/ad_position/c9bfd8dce38442cc95a232a6f4b5d5c1',
      promptText: '生成招生主题海报，突出课程卖点与报名信息',
      cardRotateDeg: 3,
      cardOffsetX: 353,
      cardZIndex: 4,
    },
  ],
  sections: [
    {
      id: 1,
      title: '小红书封面',
      emoji: '',
      displayTitle: '小红书封面',
      moreText: '更多',
      items: [
        {
          id: 101,
          title: '猫咪行为科普小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/63ac3cbe-eaa5-4bfb-a0a8-9236bcb344c7?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成猫咪行为科普小红书封面',
        },
        {
          id: 102,
          title: '职场干货小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/3af37889-5bc8-4ddc-bde9-d987de9647e6?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成职场干货小红书封面',
        },
        {
          id: 103,
          title: '排版设计教学小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/572568ca-fd06-44f2-805f-27fad19653ba?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成排版设计教学小红书封面',
        },
        {
          id: 104,
          title: '互联网运营干货小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8d79ff21-649b-41cb-a31e-02b9dc292889?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成互联网运营干货小红书封面',
        },
        {
          id: 105,
          title: '自媒体标题干货小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/8a880494-5b46-472a-963a-65713fa54645?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成自媒体标题干货小红书封面',
        },
        {
          id: 106,
          title: '科学育儿干货小红书封面',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/15/875ee589-6e1a-416e-86ff-3a49e1a0efb2?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成科学育儿干货小红书封面',
        },
      ],
    },
    {
      id: 2,
      title: '营销海报',
      emoji: '',
      displayTitle: '营销海报',
      moreText: '更多',
      items: [
        {
          id: 201,
          title: '3D黏土软陶风少儿英语启蒙招生海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/5c584750-37a2-43db-9b22-c31c90ce05ae?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成3D黏土软陶风少儿英语启蒙招生海报',
        },
        {
          id: 202,
          title: '线圈笔记本手绘风少儿托管招生海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/c8ba872c-947a-476f-be7b-5e3065499b0c?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成线圈笔记本手绘风少儿托管招生海报',
        },
        {
          id: 203,
          title: '卡通涂鸦拼贴风招聘海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/873ad4f8-e5c6-405d-b59d-a80175e5039e?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成卡通涂鸦拼贴风招聘海报',
        },
        {
          id: 204,
          title: '复古手账拼贴风招聘海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/10/5f12db05-8ccc-4a2c-93b3-8940af54791b?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成复古手账拼贴风招聘海报',
        },
        {
          id: 205,
          title: '极简高级ins风618开门红促销海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/aacdf4c9-e2a0-45c8-a032-d943a0be7318?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成极简高级ins风618开门红促销海报',
        },
        {
          id: 206,
          title: '渐变红高端立体618促销海报',
          coverUrl:
            'https://pub-cdn-oss.chuangkit.com/content/inspiration/collection/thumb/2026/06/11/ca05359c-aaf6-4bdb-ad74-b66d4a50aadd?imageMogr2%2Fthumbnail%2F400x%3E%2Fformat%2Fwebp/cgif/35',
          promptText: '生成渐变红高端立体618促销海报',
        },
      ],
    },
  ],
}
