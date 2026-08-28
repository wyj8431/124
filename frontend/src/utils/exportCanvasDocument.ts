// 工单编号：网站学院-All poster低代码开发平台项目-海报多人协作编辑任务工单

import { drawShape, type ShapeKind } from '@/modules/editor/addPanelCatalog.mjs'
import { createImageEditState, cropImageSourceRect, imageEditCssFilter, type ImageEditState } from '@/modules/editor/imageEditState.mjs'

export type ExportFormat = 'png' | 'jpeg'

export interface ExportBrushPoint {
  x: number
  y: number
}

export interface ExportLayer {
  type: 'text' | 'image' | 'shape' | 'brush'
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  opacity?: number
  rotation?: number
  imageEdit?: Partial<ImageEditState>
  shape?: ShapeKind
  points?: ExportBrushPoint[]
  brushWidth?: number
}

export interface ExportDocument {
  width: number
  height: number
  background: string
  layers: ExportLayer[]
}

export interface ExportOptions {
  format: ExportFormat
  scale: number
  quality: number
}

export function exportMimeType(format: ExportFormat) {
  return format === 'jpeg' ? 'image/jpeg' : 'image/png'
}

export function clampExportOptions(options: Partial<ExportOptions>): ExportOptions {
  return {
    format: options.format === 'jpeg' ? 'jpeg' : 'png',
    scale: Math.max(1, Math.min(4, Math.round(options.scale || 2))),
    quality: Math.max(0.1, Math.min(1, options.quality ?? 0.92)),
  }
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function drawRoundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(Math.max(0, radius), width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.lineTo(x + width - safeRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  context.lineTo(x + width, y + height - safeRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  context.lineTo(x + safeRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  context.lineTo(x, y + safeRadius)
  context.quadraticCurveTo(x, y, x + safeRadius, y)
  context.closePath()
}

export async function renderDocumentToDataUrl(document: ExportDocument, rawOptions: Partial<ExportOptions>) {
  const options = clampExportOptions(rawOptions)
  const output = window.document.createElement('canvas')
  output.width = document.width * options.scale
  output.height = document.height * options.scale
  const context = output.getContext('2d')
  if (!context) throw new Error('浏览器不支持画布导出')

  await Promise.allSettled(document.layers
    .filter((layer) => layer.type === 'text')
    .map((layer) => {
      const fontFamily = layer.fontFamily || 'Source Han Sans SC'
      return window.document.fonts.load(`${layer.fontWeight || 500} ${layer.fontSize || 28}px "${fontFamily}"`, layer.content || '')
    }))

  context.scale(options.scale, options.scale)
  context.fillStyle = document.background
  context.fillRect(0, 0, document.width, document.height)
  for (const layer of document.layers) {
    context.globalAlpha = layer.opacity ?? 1
    if (layer.type === 'text') {
      context.fillStyle = layer.color || '#111827'
      const fontFamily = layer.fontFamily || 'Source Han Sans SC'
      context.font = `${layer.fontWeight || 500} ${layer.fontSize || 28}px "${fontFamily}", sans-serif`
      context.textBaseline = 'top'
      context.fillText(layer.content || '', layer.x, layer.y)
    } else if (layer.type === 'shape') {
      context.fillStyle = layer.color || '#0773fc'
      drawShape(context, layer.shape || 'rect', layer.x, layer.y, layer.width, layer.height)
    } else if (layer.type === 'brush' && layer.points?.length) {
      const [first, ...rest] = layer.points
      context.strokeStyle = layer.color || '#111827'
      context.lineWidth = Math.max(1, layer.brushWidth || 1)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.beginPath()
      context.moveTo(first.x, first.y)
      rest.forEach((point) => context.lineTo(point.x, point.y))
      context.stroke()
    } else if (layer.src) {
      const image = await loadImage(layer.src)
      if (image) {
        const edit = createImageEditState(layer.imageEdit)
        const source = cropImageSourceRect(image.naturalWidth, image.naturalHeight, edit.crop)
        const halfWidth = layer.width / 2
        const halfHeight = layer.height / 2
        const rotation = ((layer.rotation || 0) * Math.PI) / 180
        context.save()
        context.translate(layer.x + halfWidth, layer.y + halfHeight)
        context.rotate(rotation)
        context.scale(edit.flipX ? -1 : 1, edit.flipY ? -1 : 1)
        drawRoundedRectPath(context, -halfWidth, -halfHeight, layer.width, layer.height, edit.cornerRadius)
        context.clip()
        context.filter = imageEditCssFilter(edit)
        if (edit.shadowEnabled) {
          context.shadowColor = 'rgba(15, 23, 42, .26)'
          context.shadowBlur = 24
          context.shadowOffsetY = 10
        }
        context.drawImage(image, source.x, source.y, source.width, source.height, -halfWidth, -halfHeight, layer.width, layer.height)
        context.restore()
        if (edit.borderWidth) {
          context.save()
          context.translate(layer.x + halfWidth, layer.y + halfHeight)
          context.rotate(rotation)
          context.scale(edit.flipX ? -1 : 1, edit.flipY ? -1 : 1)
          drawRoundedRectPath(context, -halfWidth, -halfHeight, layer.width, layer.height, edit.cornerRadius)
          context.lineWidth = edit.borderWidth
          context.strokeStyle = edit.borderColor
          context.stroke()
          context.restore()
        }
      }
    }
  }
  context.globalAlpha = 1
  return output.toDataURL(exportMimeType(options.format), options.quality)
}
