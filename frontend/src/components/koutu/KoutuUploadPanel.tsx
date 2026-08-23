import { useCallback, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import {
  KOUTU_DEMO_VIDEO,
  KOUTU_SAMPLE_IMAGES,
  KOUTU_UPLOAD_HINT,
} from '@/data/koutuPageData'

interface KoutuUploadPanelProps {
  onUploadFiles: (files: File[]) => void
}

export function KoutuUploadPanel({ onUploadFiles }: KoutuUploadPanelProps) {
  const singleInputRef = useRef<HTMLInputElement>(null)
  const batchInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null, multiple: boolean) => {
      if (!fileList?.length) return
      const files = multiple ? Array.from(fileList) : [fileList[0]]
      onUploadFiles(files)
    },
    [onUploadFiles],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      handleFiles(event.dataTransfer.files, false)
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
          <video autoPlay loop muted playsInline poster="">
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
                          window.open(url, '_blank', 'noopener,noreferrer')
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
            accept="image/jpeg,image/png,image/jpg"
            onChange={(event) => handleFiles(event.target.files, false)}
          />
          <input
            ref={batchInputRef}
            className="koutu-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={(event) => handleFiles(event.target.files, true)}
          />
        </div>
      </div>

      <button type="button" className="koutu-help-icon" aria-label="帮助">
        <CircleHelp className="h-4 w-4" />
      </button>
    </div>
  )
}
