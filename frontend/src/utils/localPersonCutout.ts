interface SegmentationResults {
  segmentationMask: HTMLCanvasElement | HTMLImageElement | ImageBitmap
}

interface SegmentationInstance {
  initialize(): Promise<void>
  onResults(listener: (results: SegmentationResults) => void): void
  send(inputs: { image: HTMLCanvasElement }): Promise<void>
  setOptions(options: { modelSelection: number }): void
}

declare global {
  interface Window {
    SelfieSegmentation?: new (config: { locateFile: (path: string) => string }) => SegmentationInstance
  }
}

let segmentationPromise: Promise<SegmentationInstance> | undefined

function getSegmentation() {
  segmentationPromise ??= (async () => {
    if (!window.SelfieSegmentation) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '/models/selfie-segmentation/selfie_segmentation.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('无法加载人物分割模型'))
        document.head.appendChild(script)
      })
    }
    if (!window.SelfieSegmentation) throw new Error('人物分割模型未就绪')
    const segmentation = new window.SelfieSegmentation({
      locateFile: (path) => `/models/selfie-segmentation/${path}`,
    })
    segmentation.setOptions({ modelSelection: 1 })
    await segmentation.initialize()
    return segmentation
  })()
  return segmentationPromise
}

function loadImage(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取待抠图图片'))
    }
    image.src = url
  })
}

/** Runs person segmentation locally and returns a PNG with only the foreground. */
export async function removePersonBackground(file: File): Promise<File> {
  const image = await loadImage(file)
  const source = document.createElement('canvas')
  source.width = image.naturalWidth
  source.height = image.naturalHeight
  source.getContext('2d')?.drawImage(image, 0, 0)

  const segmentation = await getSegmentation()
  const mask = await new Promise<HTMLCanvasElement>((resolve, reject) => {
    segmentation.onResults((results) => {
      const result = document.createElement('canvas')
      result.width = source.width
      result.height = source.height
      result.getContext('2d')?.drawImage(results.segmentationMask, 0, 0, source.width, source.height)
      resolve(result)
    })
    segmentation.send({ image: source }).catch(reject)
  })

  const output = document.createElement('canvas')
  output.width = source.width
  output.height = source.height
  const context = output.getContext('2d')
  if (!context) throw new Error('浏览器不支持图片抠图画布')
  context.drawImage(source, 0, 0)
  context.globalCompositeOperation = 'destination-in'
  context.drawImage(mask, 0, 0)

  const blob = await new Promise<Blob>((resolve, reject) => {
    output.toBlob((value) => value ? resolve(value) : reject(new Error('无法生成透明图')), 'image/png')
  })
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-cutout.png`, { type: 'image/png' })
}
