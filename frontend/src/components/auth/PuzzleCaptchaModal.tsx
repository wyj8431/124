import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, RefreshCw, X } from 'lucide-react'
import '@/styles/puzzle-captcha.css'

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 160
const PIECE_SIZE = 44
const TOLERANCE = 6

const CAPTCHA_IMAGES = [
  'https://picsum.photos/seed/captcha-a/640/320',
  'https://picsum.photos/seed/captcha-b/640/320',
  'https://picsum.photos/seed/captcha-c/640/320',
  'https://picsum.photos/seed/captcha-d/640/320',
]

function randomTargetX() {
  const min = 80
  const max = CANVAS_WIDTH - PIECE_SIZE - 24
  return Math.floor(min + Math.random() * (max - min))
}

export function PuzzleCaptchaModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  const [seed, setSeed] = useState(0)
  const [targetX, setTargetX] = useState(() => randomTargetX())
  const [offsetX, setOffsetX] = useState(0)
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const [tip, setTip] = useState('向右拖动滑块填充拼图')

  const imageUrl = useMemo(
    () => CAPTCHA_IMAGES[seed % CAPTCHA_IMAGES.length],
    [seed],
  )

  const maxOffset = CANVAS_WIDTH - PIECE_SIZE
  const pieceTop = (CANVAS_HEIGHT - PIECE_SIZE) / 2

  const reset = useCallback(() => {
    setTargetX(randomTargetX())
    setOffsetX(0)
    setStatus('idle')
    setTip('向右拖动滑块填充拼图')
  }, [])

  const refresh = useCallback(() => {
    setSeed((value) => value + 1)
    reset()
  }, [reset])

  useEffect(() => {
    if (!open) return
    refresh()
  }, [open, refresh])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const finishDrag = useCallback(() => {
    if (!draggingRef.current || status !== 'idle') return
    draggingRef.current = false

    if (Math.abs(offsetX - targetX) <= TOLERANCE) {
      setStatus('success')
      setTip('验证成功')
      window.setTimeout(() => {
        onSuccess()
      }, 450)
      return
    }

    setStatus('fail')
    setTip('验证失败，请重试')
    window.setTimeout(() => {
      reset()
    }, 700)
  }, [offsetX, targetX, status, onSuccess, reset])

  useEffect(() => {
    if (!open) return

    const onMove = (clientX: number) => {
      if (!draggingRef.current || status !== 'idle') return
      const delta = clientX - startXRef.current
      const next = Math.max(0, Math.min(maxOffset, startOffsetRef.current + delta))
      setOffsetX(next)
    }

    const onMouseMove = (event: MouseEvent) => onMove(event.clientX)
    const onMouseUp = () => finishDrag()
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches[0]) onMove(event.touches[0].clientX)
    }
    const onTouchEnd = () => finishDrag()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [open, finishDrag, maxOffset, status])

  const startDrag = (clientX: number) => {
    if (status !== 'idle') return
    draggingRef.current = true
    startXRef.current = clientX
    startOffsetRef.current = offsetX
  }

  if (!open) return null

  return (
    <div className="ai-puzzle-captcha" role="dialog" aria-modal="true" aria-label="拼图验证">
      <button type="button" className="ai-puzzle-captcha__mask" aria-label="关闭" onClick={onClose} />

      <div
        className={`ai-puzzle-captcha__panel${
          status === 'success' ? ' ai-puzzle-captcha__panel--success' : ''
        }${status === 'fail' ? ' ai-puzzle-captcha__panel--fail' : ''}`}
      >
        <div className="ai-puzzle-captcha__head">
          <div className="ai-puzzle-captcha__title">安全验证</div>
          <button type="button" className="ai-puzzle-captcha__close" onClick={onClose} aria-label="关闭">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="ai-puzzle-captcha__canvas">
          <img src={imageUrl} alt="" className="ai-puzzle-captcha__bg" draggable={false} />
          <div className="ai-puzzle-captcha__hole" style={{ left: targetX, top: pieceTop }} />
          <div className="ai-puzzle-captcha__piece" style={{ left: offsetX, top: pieceTop }}>
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              style={{ marginLeft: -offsetX, marginTop: -pieceTop }}
            />
          </div>
          <button type="button" className="ai-puzzle-captcha__refresh" onClick={refresh} aria-label="刷新验证码">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="ai-puzzle-captcha__track-wrap">
          <div className="ai-puzzle-captcha__track">
            <div className="ai-puzzle-captcha__track-fill" style={{ width: offsetX + 36 }} />
            <div className="ai-puzzle-captcha__track-text">
              {status === 'idle' ? '向右拖动滑块填充拼图' : tip}
            </div>
            <button
              type="button"
              className="ai-puzzle-captcha__thumb"
              style={{ transform: `translateX(${offsetX}px)` }}
              onMouseDown={(event) => {
                event.preventDefault()
                startDrag(event.clientX)
              }}
              onTouchStart={(event) => {
                if (event.touches[0]) startDrag(event.touches[0].clientX)
              }}
              aria-label="拖动滑块"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={`ai-puzzle-captcha__tip${
            status === 'fail'
              ? ' ai-puzzle-captcha__tip--error'
              : status === 'success'
                ? ' ai-puzzle-captcha__tip--success'
                : ''
          }`}
        >
          {tip}
        </div>
      </div>
    </div>
  )
}
