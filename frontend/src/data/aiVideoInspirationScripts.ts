/** 官网详情页完整分镜脚本（短 prompt 无法展示时使用） */
export const AI_VIDEO_INSPIRATION_DETAIL_SCRIPTS: Record<string, string> = {
  '短剧带货::0': `0-4 秒画面：男人坐在椅子上转头看向身后女人，镜头缓慢推进给女人特写，电影级质感，光影高级，环境音紧张，女人先抬手对男子比了个五，生气的说：“给你五百两黄金，请你立刻离开我地女儿”
4-8 秒画面：男人一愣，无奈的说 “孃孃，我们是真心相爱噻” 女人抬起手竖起一个根手指说：“再给你加一百两”，环境音低沉。
8-12 秒中景画面：男子喝了一大口酒，愤怒的把碗拍在桌子上转头和女人说道：“您这是逼我呀”
12-15 秒画面：女人愤怒起身，情绪激动，生气大喊道：“就逼你怎么了，赶紧离开我女儿，劳资蜀道山” 说完扭头起身就要走。
15-18 秒画面：男人连忙起身叫住女人：“孃孃，您别急！” 说完男子弯腰在桌子下面拿出茅台酒对女人说 “您看这是什么” 环境音惊喜，严肃气氛瞬间垮掉，画风突变搞笑。
18-21 秒画风搞笑：女人表情从严肃变笑脸，手拍大腿笑着说：“姑爷，这就是传说中的茅台吗？” 男人得意的说：“没错，53 度酱香型” 女人说：“好嘛，明天我让闺女出嫁”`,
}

export function getInspirationDetailScript(
  sectionTitle: string,
  cardIndex: number,
  fallback: string,
) {
  return AI_VIDEO_INSPIRATION_DETAIL_SCRIPTS[`${sectionTitle}::${cardIndex}`] ?? fallback
}

/** 长分镜脚本用深色块，短提示词用浅色用户气泡（与官网一致） */
export function isLongFormScript(text: string) {
  return (
    text.includes('秒画面') ||
    text.includes('秒中景') ||
    text.includes('秒画风') ||
    text.split('\n').filter(Boolean).length > 2 ||
    text.length > 80
  )
}
