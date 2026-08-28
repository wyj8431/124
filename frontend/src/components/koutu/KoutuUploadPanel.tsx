import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { CircleHelp } from 'lucide-react'
import {
  KOUTU_DEMO_POSTER,
  KOUTU_DEMO_VIDEO,
  KOUTU_SAMPLE_IMAGES,
  KOUTU_UPLOAD_HINT,
} from '@/data/koutuPageData'

export const KOUTU_MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const KOUTU_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const

interface KoutuUploadPanelProps {
  onUploadFiles: (files: File[]) => void
  onUploadError?: (message: string) => void
  errorMessage?: string
}

function validateFile(file: File): string | null {
  if (!KOUTU_IMAGE_TYPES.includes(file.type as (typeof KOUTU_IMAGE_TYPES)[number])) {
    return `${file.name}：图片类型不受支持`
  }
  if (file.size <= 0 || file.size > KOUTU_MAX_IMAGE_SIZE) {
    return `${file.name}：文件大小不能超过 5MB`
  }
  return null
}

export function KoutuUploadPanel({ onUploadFiles, onUploadError, errorMessage }: KoutuUploadPanelProps) {
  const singleInputRef = useRef<HTMLInputElement>(null)
  const batchInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null, multiple: boolean) => {
      if (!fileList?.length) return
      const files = multiple ? Array.from(fileList) : [fileList[0]]
      const errors: string[] = []
      const validFiles = files.filter((file) => {
        const error = validateFile(file)
        if (error) errors.push(error)
        return !error
      })
      if (errors.length) onUploadError?.(errors.join('；'))
      if (validFiles.length) onUploadFiles(validFiles)
    },
    [onUploadError, onUploadFiles],
  )

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, multiple: boolean) => {
      handleFiles(event.target.files, multiple)
      event.target.value = ''
    },
    [handleFiles],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      handleFiles(event.dataTransfer.files, true)
    },
    [handleFiles],
  )

  const openSinglePicker = () => singleInputRef.current?.click()
  const openBatchPicker = () => batchInputRef.current?.click()

  return (
    <div className="tool-upload-assembly">
      <h1 className="tool-upload-assembly__title">AI抠图</h1>
      <p className="tool-upload-assembly__desc">一键去除主体背景</p>

      <div className="tool-upload-assembly__content">
        <div className="koutu-content__left">
          <video autoPlay loop muted playsInline poster={KOUTU_DEMO_POSTER}>
            <source src={KOUTU_DEMO_VIDEO} type="video/mp4" />
          </video>
        </div>

        <div
          className={`koutu-content__right koutu-dropzone${dragging ? ' koutu-dropzone--dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="koutu-content__right-default">
            <div className="koutu-default-top">
              <div className="koutu-top-buttons">
                <button
                  type="button"
                  className="koutu-upload-button koutu-upload-button--batch"
                  onClick={openBatchPicker}
                >
                  批量上传
                </button>
                <button
                  type="button"
                  className="koutu-upload-button koutu-upload-button--single"
                  onClick={openSinglePicker}
                >
                  上传图片
                </button>
              </div>
              <p className="koutu-default-top__hint">{KOUTU_UPLOAD_HINT}</p>
              <p className="koutu-dropzone__drag-hint">{dragging ? '松开鼠标开始处理' : '也可以将图片拖到这里'}</p>
              {errorMessage ? <p className="koutu-upload-error" role="alert">{errorMessage}</p> : null}
            </div>

            <div className="koutu-default-line">
              <span>没有图片？试试这些</span>
            </div>

            <ul className="koutu-default-bottom">
              {KOUTU_SAMPLE_IMAGES.map((url) => (
                <li key={url}>
                  <button
                    type="button"
                    className="koutu-bottom-item"
                    style={{ backgroundImage: `url("${url}")` }}
                    aria-label="使用示例图片"
                    onClick={() => {
                      fetch(url)
                        .then((res) => res.blob())
                        .then((blob) => {
                          const file = new File([blob], 'sample.png', { type: blob.type || 'image/png' })
                          onUploadFiles([file])
                        })
                        .catch(() => {
                          onUploadError?.('示例图片加载失败，请重新选择本地图片')
                        })
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>

          <input
            ref={singleInputRef}
            className="koutu-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(event) => handleInputChange(event, false)}
          />
          <input
            ref={batchInputRef}
            className="koutu-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            multiple
            onChange={(event) => handleInputChange(event, true)}
          />
        </div>
      </div>

      <button type="button" className="koutu-help-icon" aria-label="帮助" title="帮助">
        <CircleHelp className="h-4 w-4" />
      </button>
    </div>
  )
}
