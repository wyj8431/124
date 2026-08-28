import {
  ArrowDown,
  ArrowUp,
  Baseline,
  Check,
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Layers3,
  LockKeyhole,
  MoreHorizontal,
  MoveDown,
  MoveUp,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  SquareDashed,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { createImageEditState, type ImageEditState } from '@/modules/editor/imageEditState.mjs'

export type EditableImageLayer = {
  id: string
  type: string
  src?: string
  x: number
  y: number
  width: number
  height: number
  opacity?: number
  rotation?: number
  imageEdit?: Partial<ImageEditState>
}

type ImageLayerPatch = Partial<Omit<EditableImageLayer, 'id' | 'type'>>

type ImageEditPanelProps = {
  layer: EditableImageLayer
  readOnly?: boolean
  onUpdate: (patch: ImageLayerPatch) => void
  onReplace: () => void
  onSetBackground: () => void
  onClose: () => void
  onDelete: () => void
  onMoveLayer: (direction: 'up' | 'down' | 'front' | 'back') => void
}

type EditorSection = 'filter' | 'adjust' | 'crop' | 'effects' | null

const filters = [
  { id: 'original', label: '原图', value: {} },
  { id: 'fresh', label: '清透', value: { brightness: 1.08, contrast: 1.05, saturation: 1.18 } },
  { id: 'warm', label: '暖阳', value: { brightness: 1.05, contrast: 1.08, saturation: 1.25 } },
  { id: 'mono', label: '黑白', value: { saturation: 0, contrast: 1.12 } },
]

const cropPresets: Array<{ id: string; label: string; crop: ImageEditState['crop'] }> = [
  { id: 'free', label: '原比例', crop: { x: 0, y: 0, width: 1, height: 1 } },
  { id: 'square', label: '正方形', crop: { x: 0.125, y: 0, width: 0.75, height: 1 } },
  { id: 'portrait', label: '竖版', crop: { x: 0.2, y: 0, width: 0.6, height: 1 } },
]

export function ImageEditPanel({ layer, readOnly = false, onUpdate, onReplace, onSetBackground, onClose, onDelete, onMoveLayer }: ImageEditPanelProps) {
  const [openSection, setOpenSection] = useState<EditorSection>(null)
  const state = useMemo(() => createImageEditState(layer.imageEdit), [layer.imageEdit])
  const rotation = layer.rotation || 0

  const updateState = (patch: Partial<ImageEditState>) => {
    onUpdate({ imageEdit: { ...state, ...patch } })
  }

  const toggleSection = (section: Exclude<EditorSection, null>) => {
    setOpenSection((current) => current === section ? null : section)
  }

  return (
    <section className="design-editor-image-edit-panel" aria-label="图片编辑">
      <div className="design-editor-image-edit-head">
        <strong><ImagePlus className="h-4 w-4" />图片编辑</strong>
        <button type="button" onClick={onClose} aria-label="关闭图片编辑"><X className="h-4 w-4" /></button>
      </div>
      <div className="design-editor-image-edit-actions">
        <button type="button" onClick={onReplace} disabled={readOnly}><ImagePlus className="h-4 w-4" />替换图片</button>
        <button type="button" onClick={onSetBackground} disabled={readOnly}><SquareDashed className="h-4 w-4" />设为背景</button>
      </div>

      <div className="design-editor-image-edit-divider" />
      <p className="design-editor-image-edit-label">工具</p>
      <div className="design-editor-image-edit-tool-grid">
        <button type="button" className={openSection === 'filter' ? 'is-active' : undefined} onClick={() => toggleSection('filter')}><WandSparkles /><span>滤镜</span></button>
        <button type="button" className={openSection === 'adjust' ? 'is-active' : undefined} onClick={() => toggleSection('adjust')}><SlidersHorizontal /><span>调整</span></button>
        <button type="button" onClick={() => updateState({ brightness: 1.08, contrast: 1.12, saturation: 1.22 })}><Sparkles /><span>AI滤镜</span></button>
        <button type="button" className={openSection === 'crop' ? 'is-active' : undefined} onClick={() => toggleSection('crop')}><Crop /><span>裁剪</span></button>
        <button type="button" onClick={() => onUpdate({ rotation: (rotation + 90) % 360 })}><RotateCcw /><span>旋转</span></button>
        <button type="button" onClick={() => updateState({ flipX: !state.flipX })}><FlipHorizontal2 /><span>水平翻转</span></button>
        <button type="button" onClick={() => updateState({ flipY: !state.flipY })}><FlipVertical2 /><span>垂直翻转</span></button>
        <button type="button" className={state.shadowEnabled ? 'is-active' : undefined} onClick={() => updateState({ shadowEnabled: !state.shadowEnabled })}><Layers3 /><span>投影</span></button>
      </div>

      {openSection === 'filter' ? (
        <div className="design-editor-image-edit-subpanel">
          <div className="design-editor-image-edit-subhead"><strong>滤镜</strong><button type="button" onClick={() => updateState(createImageEditState())}>重置</button></div>
          <div className="design-editor-image-filter-grid">
            {filters.map((filter) => <button key={filter.id} type="button" onClick={() => updateState(filter.value)}><span className={`design-editor-image-filter-preview is-${filter.id}`} /><span>{filter.label}</span>{filter.id === 'original' && state.saturation === 1 && state.brightness === 1 ? <Check className="h-3 w-3" /> : null}</button>)}
          </div>
        </div>
      ) : null}

      {openSection === 'adjust' ? (
        <div className="design-editor-image-edit-subpanel">
          <div className="design-editor-image-edit-subhead"><strong>调整</strong><button type="button" onClick={() => updateState(createImageEditState())}>重置</button></div>
          {([['brightness', '亮度', 0, 2, .05], ['contrast', '对比度', 0, 2, .05], ['saturation', '饱和度', 0, 2, .05], ['blur', '模糊', 0, 20, 1]] as const).map(([key, label, min, max, step]) => <label key={key} className="design-editor-image-range"><span>{label}</span><input type="range" min={min} max={max} step={step} value={state[key]} onChange={(event) => updateState({ [key]: Number(event.target.value) })} disabled={readOnly} /><output>{key === 'blur' ? `${state[key]}px` : `${Math.round(state[key] * 100)}%`}</output></label>)}
        </div>
      ) : null}

      {openSection === 'crop' ? (
        <div className="design-editor-image-edit-subpanel">
          <div className="design-editor-image-edit-subhead"><strong>裁剪比例</strong><button type="button" onClick={() => updateState({ crop: { x: 0, y: 0, width: 1, height: 1 } })}>恢复原图</button></div>
          <div className="design-editor-image-crop-grid">
            {cropPresets.map(({ id, label, crop }) => <button key={id} type="button" onClick={() => updateState({ crop })}>{label}</button>)}
          </div>
        </div>
      ) : null}

      <div className="design-editor-image-edit-divider" />
      <p className="design-editor-image-edit-label">特效</p>
      <div className="design-editor-image-effect-list">
        <button type="button" onClick={() => updateState({ cornerRadius: state.cornerRadius ? 0 : 18 })}><span><SquareDashed className="h-4 w-4" />圆角</span><b>{state.cornerRadius ? '已开启' : '关闭'}</b></button>
        <button type="button" onClick={() => updateState({ borderWidth: state.borderWidth ? 0 : 2 })}><span><Baseline className="h-4 w-4" />描边</span><b>{state.borderWidth ? '已开启' : '关闭'}</b></button>
        <button type="button" onClick={() => setOpenSection('effects')}><span><MoreHorizontal className="h-4 w-4" />更多效果</span><ArrowDown className="h-4 w-4" /></button>
      </div>
      {openSection === 'effects' ? <div className="design-editor-image-edit-subpanel"><label className="design-editor-image-range"><span>透明度</span><input type="range" min="0.1" max="1" step="0.05" value={layer.opacity ?? 1} onChange={(event) => onUpdate({ opacity: Number(event.target.value) })} disabled={readOnly} /><output>{Math.round((layer.opacity ?? 1) * 100)}%</output></label><label className="design-editor-image-range"><span>旋转</span><input type="range" min="-180" max="180" step="1" value={rotation > 180 ? rotation - 360 : rotation} onChange={(event) => onUpdate({ rotation: Number(event.target.value) })} disabled={readOnly} /><output>{rotation}°</output></label></div> : null}

      <div className="design-editor-image-edit-divider" />
      <p className="design-editor-image-edit-label">属性</p>
      <div className="design-editor-image-edit-properties">
        <label>X<input type="number" value={Math.round(layer.x)} onChange={(event) => onUpdate({ x: Number(event.target.value) || 0 })} disabled={readOnly} /></label>
        <label>Y<input type="number" value={Math.round(layer.y)} onChange={(event) => onUpdate({ y: Number(event.target.value) || 0 })} disabled={readOnly} /></label>
        <label>宽<input type="number" min="1" value={Math.round(layer.width)} onChange={(event) => onUpdate({ width: Number(event.target.value) || 1 })} disabled={readOnly} /></label>
        <label>高<input type="number" min="1" value={Math.round(layer.height)} onChange={(event) => onUpdate({ height: Number(event.target.value) || 1 })} disabled={readOnly} /></label>
      </div>

      <div className="design-editor-image-edit-layer-actions" aria-label="图层顺序">
        <button type="button" onClick={() => onMoveLayer('back')} disabled={readOnly} aria-label="置于底层" title="置于底层"><ArrowDown /></button>
        <button type="button" onClick={() => onMoveLayer('down')} disabled={readOnly} aria-label="下移一层" title="下移一层"><MoveDown /></button>
        <button type="button" onClick={() => onMoveLayer('up')} disabled={readOnly} aria-label="上移一层" title="上移一层"><MoveUp /></button>
        <button type="button" onClick={() => onMoveLayer('front')} disabled={readOnly} aria-label="置于顶层" title="置于顶层"><ArrowUp /></button>
        <button type="button" onClick={onDelete} disabled={readOnly} aria-label="删除图片" title="删除图片"><Trash2 /></button>
      </div>
      <div className="design-editor-image-edit-lock"><LockKeyhole className="h-3.5 w-3.5" /> 图片编辑结果会随当前设计保存</div>
    </section>
  )
}
