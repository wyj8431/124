import type { DesignScene } from '@/types'
import { ChevronRight } from '@/components/layout/LayoutParts'
import { coverFallback } from '@/utils'

interface Props {
  scenes: DesignScene[]
  onCreate: (sceneId?: number) => void
}

export function QuickCreate({ scenes, onCreate }: Props) {
  const createScene = scenes.find((s) => s.code === 'create') ?? scenes[0]
  const canvasScene = scenes.find((s) => s.code === 'infinite_canvas')
  const editScene = scenes.find((s) => s.code === 'image_edit')

  return (
    <div className="mb-8 flex gap-4 px-6">
      {/* 创建设计 - 大卡片 */}
      <div
        onClick={() => onCreate(createScene?.id)}
        className="group relative flex w-[280px] shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 transition hover:shadow-lg"
      >
        <div>
          <div className="text-base font-semibold text-ckt-text">创建设计</div>
          <div className="mt-1 text-xs text-ckt-text-secondary">高频创作场景一键直达</div>
          <button className="mt-3 flex items-center gap-1 text-xs font-medium text-ckt-primary">
            立即体验 <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-ckt-primary/30 bg-white/60">
            <span className="text-3xl text-ckt-primary">+</span>
          </div>
        </div>
      </div>

      {/* 右侧两个小卡片 */}
      <div className="flex flex-1 flex-col gap-4">
        {[canvasScene, editScene].filter(Boolean).map((scene) => (
          <div
            key={scene!.id}
            onClick={() => onCreate(scene!.id)}
            className="group flex flex-1 cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-white p-5 transition hover:shadow-md"
          >
            <div>
              <div className="text-sm font-semibold text-ckt-text">{scene!.name}</div>
              <div className="mt-0.5 text-xs text-ckt-text-secondary">点击即可快速开始</div>
            </div>
            <img
              src={coverFallback(`scene-${scene!.id}`, 120, 80)}
              alt=""
              className="h-16 w-24 rounded-lg object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
