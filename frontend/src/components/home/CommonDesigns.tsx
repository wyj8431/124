import type { DesignScene } from '@/types'

const SCENE_ICONS: Record<string, { bg: string; emoji: string }> = {
  create: { bg: 'bg-blue-50', emoji: '✨' },
  infinite_canvas: { bg: 'bg-purple-50', emoji: '🎨' },
  image_edit: { bg: 'bg-green-50', emoji: '🖼️' },
  xiaohongshu: { bg: 'bg-red-50', emoji: '📕' },
  wechat_cover: { bg: 'bg-emerald-50', emoji: '💬' },
  fullscreen_poster: { bg: 'bg-orange-50', emoji: '📱' },
  ppt: { bg: 'bg-amber-50', emoji: '📊' },
  business_card: { bg: 'bg-cyan-50', emoji: '💳' },
  live_bg: { bg: 'bg-indigo-50', emoji: '📺' },
  mobile_poster: { bg: 'bg-sky-50', emoji: '📲' },
  product_main: { bg: 'bg-rose-50', emoji: '🛒' },
  long_poster: { bg: 'bg-violet-50', emoji: '📜' },
  invitation: { bg: 'bg-pink-50', emoji: '💌' },
  resume: { bg: 'bg-slate-50', emoji: '📋' },
  logo: { bg: 'bg-yellow-50', emoji: '🔷' },
  horizontal_poster: { bg: 'bg-teal-50', emoji: '🖼️' },
  video_cover: { bg: 'bg-fuchsia-50', emoji: '🎬' },
  product_detail: { bg: 'bg-lime-50', emoji: '📦' },
  certificate: { bg: 'bg-orange-50', emoji: '🏅' },
  daily_sign: { bg: 'bg-blue-50', emoji: '📅' },
}

interface Props {
  scenes: DesignScene[]
  onSceneClick?: (sceneId: number) => void
}

export function CommonDesigns({ scenes, onSceneClick }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold text-ckt-text">常用设计</h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {scenes.map((scene) => {
          const icon = SCENE_ICONS[scene.code] ?? { bg: 'bg-gray-50', emoji: '📄' }
          return (
            <button
              key={scene.id}
              onClick={() => onSceneClick?.(scene.id)}
              className="flex flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-gray-50"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${icon.bg}`}
              >
                {icon.emoji}
              </div>
              <span className="text-center text-xs text-ckt-text-secondary">{scene.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
