const MIN_CROP_SIZE = 0.05

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

const numericValue = (value, fallback) => Number.isFinite(value) ? value : fallback
const rounded = (value) => Math.round(value * 10000) / 10000

export const DEFAULT_IMAGE_EDIT_STATE = Object.freeze({
  brightness: 1,
  contrast: 1,
  saturation: 1,
  blur: 0,
  crop: Object.freeze({ x: 0, y: 0, width: 1, height: 1 }),
  cornerRadius: 0,
  borderWidth: 0,
  borderColor: '#ffffff',
  shadowEnabled: false,
  flipX: false,
  flipY: false,
})

export function normalizeImageCrop(value = {}) {
  const x = clamp(numericValue(value.x, 0), 0, 1 - MIN_CROP_SIZE)
  const y = clamp(numericValue(value.y, 0), 0, 1 - MIN_CROP_SIZE)
  const width = clamp(numericValue(value.width, 1), MIN_CROP_SIZE, 1 - x)
  const height = clamp(numericValue(value.height, 1), MIN_CROP_SIZE, 1 - y)
  return { x: rounded(x), y: rounded(y), width: rounded(width), height: rounded(height) }
}

export function createImageEditState(value = {}) {
  return {
    brightness: clamp(numericValue(value.brightness, 1), 0, 2),
    contrast: clamp(numericValue(value.contrast, 1), 0, 2),
    saturation: clamp(numericValue(value.saturation, 1), 0, 2),
    blur: clamp(numericValue(value.blur, 0), 0, 20),
    crop: normalizeImageCrop(value.crop),
    cornerRadius: clamp(numericValue(value.cornerRadius, 0), 0, 240),
    borderWidth: clamp(numericValue(value.borderWidth, 0), 0, 40),
    borderColor: typeof value.borderColor === 'string' ? value.borderColor : '#ffffff',
    shadowEnabled: Boolean(value.shadowEnabled),
    flipX: Boolean(value.flipX),
    flipY: Boolean(value.flipY),
  }
}

export function imageEditCssFilter(value) {
  const state = createImageEditState(value)
  return `brightness(${Math.round(state.brightness * 100)}%) contrast(${Math.round(state.contrast * 100)}%) saturate(${Math.round(state.saturation * 100)}%) blur(${state.blur}px)`
}

export function cropImageSourceRect(sourceWidth, sourceHeight, value) {
  const crop = normalizeImageCrop(value)
  return {
    x: Math.round(sourceWidth * crop.x),
    y: Math.round(sourceHeight * crop.y),
    width: Math.round(sourceWidth * crop.width),
    height: Math.round(sourceHeight * crop.height),
  }
}

export function setLayerAsBackground(document, layerId) {
  const layer = document.layers.find((item) => item.id === layerId)
  if (!layer || layer.type !== 'image') return document
  const backgroundLayer = { ...layer, x: 0, y: 0, width: document.width, height: document.height }
  return {
    ...document,
    layers: [backgroundLayer, ...document.layers.filter((item) => item.id !== layerId)],
  }
}
