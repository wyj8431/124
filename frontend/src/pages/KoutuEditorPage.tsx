import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Download, ImageOff, Loader2, PencilLine, RotateCcw, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { aiApi, mattingApi, type MattingTask } from '@/api'
import { LoginModal } from '@/components/auth/LoginModal'
import { KoutuEditorHeader } from '@/components/koutu/KoutuEditorHeader'
import { KoutuUploadPanel } from '@/components/koutu/KoutuUploadPanel'
import { useAuth } from '@/context/AuthContext'
import { removePersonBackground } from '@/utils/localPersonCutout'
import '@/styles/koutu-editor.css'

type PreviewMode = 'original' | 'result'

function mergeTaskUpdates(current: MattingTask[], updates: MattingTask[], previewSources: Map<number, string>) {
  const nextById = new Map(updates.map((task) => [task.id, task]))
  let changed = false
  const next = current.map((task) => {
    const update = nextById.get(task.id)
    if (!update) return task
    const unchanged = task.status === update.status
      && task.sourceUrl === update.sourceUrl
      && task.outputUrl === update.outputUrl
      && task.errorMsg === update.errorMsg
      && task.mock === update.mock
    if (unchanged) return task
    changed = true
    return previewSources.has(update.id)
      ? { ...update, sourceUrl: previewSources.get(update.id) }
      : update
  })
  return changed ? next : current
}

export function KoutuEditorPage() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [tasks, setTasks] = useState<MattingTask[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const [uploadError, setUploadError] = useState<string>()
  const [previewModes, setPreviewModes] = useState<Record<number, PreviewMode>>({})
  const pollingRef = useRef<number | null>(null)
  const placeholderUrlsRef = useRef<Set<string>>(new Set())
  const retryFilesRef = useRef<Map<number, File>>(new Map())
  const previewSourcesRef = useRef<Map<number, string>>(new Map())

  const refreshTasks = useCallback(async () => {
    const pending = tasks.filter((task) => task.status === 0 && task.id > 0)
    if (!pending.length) return
    const updates = await Promise.all(pending.map((task) => mattingApi.getTask(task.id).catch(() => task)))
    setTasks((current) => mergeTaskUpdates(current, updates, previewSourcesRef.current))
  }, [tasks])

  useEffect(() => {
    if (!tasks.some((task) => task.status === 0 && task.id > 0)) {
      if (pollingRef.current != null) window.clearInterval(pollingRef.current)
      pollingRef.current = null
      return
    }
    void refreshTasks()
    pollingRef.current = window.setInterval(() => void refreshTasks(), 1500)
    return () => {
      if (pollingRef.current != null) window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [refreshTasks, tasks])

  useEffect(() => () => {
    placeholderUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    placeholderUrlsRef.current.clear()
    retryFilesRef.current.clear()
    previewSourcesRef.current.clear()
  }, [])

  const handleUploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploadError(undefined)
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      const placeholders = files.map((file, index) => {
        const sourceUrl = URL.createObjectURL(file)
        placeholderUrlsRef.current.add(sourceUrl)
        const placeholder = {
          id: -(Date.now() + index),
          status: 0,
          sourceUrl,
        }
        retryFilesRef.current.set(placeholder.id, file)
        return placeholder
      })
      setTasks((current) => [...placeholders, ...current])
      setUploadingCount((current) => current + files.length)
      const created = await Promise.all(
        files.map(async (file, index) => {
          try {
            const cutoutFile = await removePersonBackground(file)
            const upload = await aiApi.upload(cutoutFile)
            return await mattingApi.createTask(upload.url)
          } catch (error) {
            return {
              ...placeholders[index],
              status: 2,
              errorMsg: error instanceof Error ? error.message : '上传或创建抠图任务失败',
            } satisfies MattingTask
          } finally {
            setUploadingCount((current) => Math.max(0, current - 1))
          }
        }),
      )
      created.forEach((task, index) => {
        previewSourcesRef.current.set(task.id, placeholders[index].sourceUrl)
      })
      placeholders.forEach((task, index) => {
        const result = created[index]
        const keepForRetry = result.status === 2 && result.sourceUrl === task.sourceUrl
        if (!keepForRetry) {
          URL.revokeObjectURL(task.sourceUrl)
          placeholderUrlsRef.current.delete(task.sourceUrl)
          retryFilesRef.current.delete(task.id)
        }
      })
      setTasks((current) => {
        const placeholderIds = new Set(placeholders.map((task) => task.id))
        return [...created, ...current.filter((task) => !placeholderIds.has(task.id))]
      })
    },
    [isLoggedIn, setShowLoginModal],
  )

  const retryTask = useCallback(async (task: MattingTask) => {
    const retryFile = retryFilesRef.current.get(task.id)
    if (!task.sourceUrl && !retryFile) return
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: 0, errorMsg: undefined } : item))
    try {
      const sourceUrl = retryFile
        ? (await aiApi.upload(await removePersonBackground(retryFile))).url
        : task.sourceUrl
      const next = await mattingApi.createTask(sourceUrl as string)
      if (retryFile) {
        if (task.sourceUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(task.sourceUrl)
          placeholderUrlsRef.current.delete(task.sourceUrl)
        }
        retryFilesRef.current.delete(task.id)
      }
      previewSourcesRef.current.set(next.id, task.sourceUrl as string)
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...next, sourceUrl: task.sourceUrl }
        : item))
    } catch (error) {
      setTasks((current) => current.map((item) => item.id === task.id ? {
        ...item,
        status: 2,
        errorMsg: error instanceof Error ? error.message : '重试失败',
      } : item))
    }
  }, [])

  const togglePreview = useCallback((taskId: number) => {
    setPreviewModes((current) => ({
      ...current,
      [taskId]: current[taskId] === 'original' ? 'result' : 'original',
    }))
  }, [])

  const handleContinueEditing = useCallback((outputUrl: string) => {
    navigate(`/editor/new?source=${encodeURIComponent(outputUrl)}`)
  }, [navigate])

  const handleHeaderUpload = useCallback(() => {
    document.querySelector<HTMLButtonElement>('.koutu-upload-button--single')?.click()
  }, [])

  const pendingCount = tasks.filter((task) => task.status === 0).length
  const statusText = uploadingCount
    ? `正在上传 ${uploadingCount} 个文件`
    : pendingCount
      ? `正在处理 ${pendingCount} 个任务`
      : '处理完成'

  return (
    <div className="ai-editor-tools-page">
      <div className="ai-editor-tools-page__header">
        <KoutuEditorHeader onUploadClick={handleHeaderUpload} />
      </div>

      <div className="ai-editor-tools-page__content">
        <KoutuUploadPanel
          onUploadFiles={handleUploadFiles}
          onUploadError={setUploadError}
          errorMessage={uploadError}
        />
        {tasks.length ? (
          <section className="koutu-task-section" aria-label="抠图任务">
            <div className="koutu-task-section__head">
              <div>
                <h2>处理结果</h2>
                <p className="koutu-task-section__subhead">上传后会自动去除背景，演示任务通常在 5 秒内完成</p>
              </div>
              <span>{statusText}</span>
            </div>
            {uploadingCount ? <div className="koutu-upload-progress" role="progressbar" aria-label="上传进度"><span /></div> : null}
            <div className="koutu-task-grid">
              {tasks.map((task) => {
                const showOriginal = previewModes[task.id] === 'original'
                const canShowResult = task.status === 1 && Boolean(task.outputUrl)
                return (
                  <article key={task.id} className="koutu-task-card">
                    <div className="koutu-task-card__comparison">
                      <div className="koutu-task-card__pane">
                        <span className="koutu-task-card__pane-label">原图</span>
                        <img src={task.sourceUrl ?? ''} alt="原图" />
                      </div>
                      <div className="koutu-task-card__pane koutu-task-card__pane--result">
                        <span className="koutu-task-card__pane-label">{showOriginal ? '原图预览' : '透明图'}</span>
                        {canShowResult && !showOriginal ? <img src={task.outputUrl} alt="抠图结果" /> : null}
                        {canShowResult && showOriginal ? <img src={task.sourceUrl ?? ''} alt="原图预览" /> : null}
                        {task.status === 0 ? (
                          <div className="koutu-task-card__state">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>{uploadingCount ? '正在上传并准备抠图' : '正在抠图'}</span>
                            <div className="koutu-task-card__progress"><span /></div>
                          </div>
                        ) : null}
                        {task.status === 2 ? (
                          <div className="koutu-task-card__state koutu-task-card__state--error">
                            <TriangleAlert className="h-6 w-6" />
                            <span>处理失败</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="koutu-task-card__footer">
                      {canShowResult ? (
                        <>
                          {task.mock ? <span className="koutu-task-card__demo-badge">本地演示结果</span> : null}
                          <a href={task.outputUrl} download target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />下载透明图
                          </a>
                          <button type="button" onClick={() => togglePreview(task.id)}>
                            <ArrowLeftRight className="h-4 w-4" />{showOriginal ? '查看抠图结果' : '恢复原图'}
                          </button>
                          <button type="button" onClick={() => handleContinueEditing(task.outputUrl as string)}>
                            <PencilLine className="h-4 w-4" />继续编辑
                          </button>
                        </>
                      ) : null}
                      {task.status === 2 ? (
                        <button type="button" onClick={() => void retryTask(task)}>
                          <RotateCcw className="h-4 w-4" />重试
                        </button>
                      ) : null}
                      {!canShowResult && task.status !== 0 && !task.errorMsg ? (
                        <span className="koutu-task-card__empty"><ImageOff className="h-4 w-4" />暂无结果</span>
                      ) : null}
                      {task.errorMsg ? <p>{task.errorMsg}</p> : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}
      </div>

      <LoginModal />
    </div>
  )
}
