import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, '../src/main/resources/db/data.sql')

/** 撤回七夕主题封面，恢复 picsum 原始预览图 */
const ORIGINAL_COVERS = {
  '中国风七夕主题海报': 'https://picsum.photos/seed/t7/400/533',
  '七夕情人节线上创意宣传海报': 'https://picsum.photos/seed/t8/400/533',
  '浪漫七夕粉色渐变手机海报': 'https://picsum.photos/seed/t13/400/533',
  '国潮风七夕节日海报': 'https://picsum.photos/seed/t14/400/533',
  '七夕鹊桥相会竖版海报': 'https://picsum.photos/seed/qixi-v1/400/700',
  '七夕浪漫邀约长图': 'https://picsum.photos/seed/qixi-long/400/900',
  '七夕活动公众号首图': 'https://picsum.photos/seed/qixi-wx/400/170',
  '七夕横版促销海报': 'https://picsum.photos/seed/qixi-h/400/225',
  '七夕小红书配图': 'https://picsum.photos/seed/qixi-xhs/400/533',
  '七夕方形朋友圈封面': 'https://picsum.photos/seed/qixi-sq/400/400',
  '七夕星空浪漫手机海报': 'https://picsum.photos/seed/qixi-mp-01/400/711',
  '七夕粉色花瓣手机海报': 'https://picsum.photos/seed/qixi-mp-02/400/711',
  '七夕鹊桥相会手机海报': 'https://picsum.photos/seed/qixi-mp-03/400/711',
  '七夕告白季手机海报': 'https://picsum.photos/seed/qixi-mp-04/400/711',
  '七夕限定礼遇手机海报': 'https://picsum.photos/seed/qixi-mp-05/400/711',
  '七夕古风插画手机海报': 'https://picsum.photos/seed/qixi-mp-06/400/711',
  '七夕甜蜜约会手机海报': 'https://picsum.photos/seed/qixi-mp-07/400/711',
  '七夕品牌活动手机海报': 'https://picsum.photos/seed/qixi-mp-08/400/711',
  '七夕红色喜庆手机海报': 'https://picsum.photos/seed/qixi-mp-09/400/711',
  '七夕简约线条手机海报': 'https://picsum.photos/seed/qixi-mp-10/400/711',
  '七夕商场促销手机海报': 'https://picsum.photos/seed/qixi-mp-11/400/650',
  '七夕餐饮美食手机海报': 'https://picsum.photos/seed/qixi-mp-12/400/760',
  '七夕美妆护肤手机海报': 'https://picsum.photos/seed/qixi-mp-13/400/711',
  '七夕鲜花礼盒手机海报': 'https://picsum.photos/seed/qixi-mp-14/400/711',
  '七夕影院约会手机海报': 'https://picsum.photos/seed/qixi-mp-15/400/711',
  '七夕珠宝首饰手机海报': 'https://picsum.photos/seed/qixi-mp-16/400/711',
  '七夕酒店度假手机海报': 'https://picsum.photos/seed/qixi-mp-17/400/650',
  '七夕咖啡茶饮手机海报': 'https://picsum.photos/seed/qixi-mp-18/400/760',
  '七夕烛光晚餐手机海报': 'https://picsum.photos/seed/qixi-mp-19/400/720',
  '七夕巧克力礼盒手机海报': 'https://picsum.photos/seed/qixi-mp-20/400/680',
  '七夕情侣写真手机海报': 'https://picsum.photos/seed/qixi-mp-21/400/780',
  '七夕汉服国风手机海报': 'https://picsum.photos/seed/qixi-mp-22/400/710',
  '七夕星空许愿手机海报': 'https://picsum.photos/seed/qixi-mp-23/400/820',
  '七夕手工DIY手机海报': 'https://picsum.photos/seed/qixi-mp-24/400/660',
  '七夕宠物萌宠手机海报': 'https://picsum.photos/seed/qixi-mp-25/400/740',
  '七夕瑜伽健身手机海报': 'https://picsum.photos/seed/qixi-mp-26/400/790',
  '七夕书店文艺手机海报': 'https://picsum.photos/seed/qixi-mp-27/400/700',
  '七夕烘焙甜品手机海报': 'https://picsum.photos/seed/qixi-mp-28/400/850',
  '七夕花店促销手机海报': 'https://picsum.photos/seed/qixi-mp-29/400/670',
  '七夕婚纱礼服手机海报': 'https://picsum.photos/seed/qixi-mp-30/400/730',
  '七夕民宿打卡手机海报': 'https://picsum.photos/seed/qixi-mp-31/400/800',
  '七夕音乐live手机海报': 'https://picsum.photos/seed/qixi-mp-32/400/760',
  '七夕护肤套装手机海报': 'https://picsum.photos/seed/qixi-mp-33/400/690',
  '七夕数码好物手机海报': 'https://picsum.photos/seed/qixi-mp-34/400/810',
  '七夕亲子活动手机海报': 'https://picsum.photos/seed/qixi-mp-35/400/750',
  '七夕公众号活动首图': 'https://picsum.photos/seed/qixi-wx-02/400/171',
  '七夕浪漫邀约公众号首图': 'https://picsum.photos/seed/qixi-wx-03/400/172',
  '七夕甜蜜攻略小红书配图': 'https://picsum.photos/seed/qixi-xhs-02/400/534',
  '七夕约会指南小红书配图': 'https://picsum.photos/seed/qixi-xhs-03/400/535',
  '七夕礼遇清单长图海报': 'https://picsum.photos/seed/qixi-long-02/400/910',
  '七夕商场横版促销海报': 'https://picsum.photos/seed/qixi-h-02/400/226',
}

let data = fs.readFileSync(dataPath, 'utf8')
let reverted = 0

for (const [title, url] of Object.entries(ORIGINAL_COVERS)) {
  const pattern = new RegExp(
    `(\\('${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*)'https:\\/\\/[^']+'`,
  )
  if (pattern.test(data)) {
    data = data.replace(pattern, `$1'${url}'`)
    reverted++
  }
}

fs.writeFileSync(dataPath, data, 'utf8')
console.log(`reverted ${reverted} qixi cover urls`)
