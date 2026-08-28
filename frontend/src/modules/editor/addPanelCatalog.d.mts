export type ShapeKind = 'rect' | 'triangle' | 'circle' | 'pill' | 'corner' | 'sparkle'

export type TextQuickPreset = {
  id: 'headline' | 'subheading' | 'body' | 'vertical' | 'effect'
  label: string
  content: string
  fontSize: number
  fontWeight: number
  width?: number
  height?: number
}

export type EditorToolId = 'image' | 'text' | 'components' | 'ai' | 'templates'

export type AddPanelAction =
  | { type: 'upload' }
  | { type: 'text'; presetId: TextQuickPreset['id'] }
  | { type: 'shape'; shape: ShapeKind }
  | { type: 'tool'; tool: EditorToolId }
  | { type: 'canvas' }

export type AddPanelCard = {
  id: string
  label: string
  icon: string
  action: AddPanelAction
}

export type AddPanelSection = {
  id: 'media' | 'text' | 'shapes' | 'components' | 'tools'
  title: string
  moreAction: AddPanelAction
  cards: AddPanelCard[]
}

export const SHAPE_KINDS: ShapeKind[]
export const editorTextQuickPresets: TextQuickPreset[]
export const editorAddPanelSections: AddPanelSection[]

export function drawShape(
  context: Pick<CanvasRenderingContext2D, 'beginPath' | 'moveTo' | 'lineTo' | 'closePath' | 'fill' | 'fillRect' | 'ellipse' | 'roundRect'>,
  shape: ShapeKind,
  x: number,
  y: number,
  width: number,
  height: number,
): void
