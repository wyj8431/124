export interface ImageCrop {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageEditState {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  crop: ImageCrop
  cornerRadius: number
  borderWidth: number
  borderColor: string
  shadowEnabled: boolean
  flipX: boolean
  flipY: boolean
}

export const DEFAULT_IMAGE_EDIT_STATE: Readonly<ImageEditState>
export function normalizeImageCrop(value?: Partial<ImageCrop>): ImageCrop
export function createImageEditState(value?: Partial<ImageEditState>): ImageEditState
export function imageEditCssFilter(value?: Partial<ImageEditState>): string
export function cropImageSourceRect(sourceWidth: number, sourceHeight: number, value?: Partial<ImageCrop>): { x: number; y: number; width: number; height: number }
export function setLayerAsBackground<T extends { id: string; type: string; x: number; y: number; width: number; height: number }, D extends { width: number; height: number; layers: T[] }>(document: D, layerId: string): D
