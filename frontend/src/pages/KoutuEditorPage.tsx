import { useCallback } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import { KoutuEditorHeader } from '@/components/koutu/KoutuEditorHeader'
import { KoutuUploadPanel } from '@/components/koutu/KoutuUploadPanel'
import { useAuth } from '@/context/AuthContext'
import '@/styles/koutu-editor.css'

export function KoutuEditorPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()

  const handleUploadFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return
      if (!isLoggedIn) {
        setShowLoginModal(true)
        return
      }
      console.info('[koutu] upload', files.map((file) => file.name))
      alert(`已选择 ${files.length} 张图片，抠图功能即将开始处理`)
    },
    [isLoggedIn, setShowLoginModal],
  )

  const handleHeaderUpload = useCallback(() => {
    document.querySelector<HTMLButtonElement>('.koutu-upload-button--single')?.click()
  }, [])

  return (
    <div className="ai-editor-tools-page">
      <div className="ai-editor-tools-page__header">
        <KoutuEditorHeader onUploadClick={handleHeaderUpload} />
      </div>

      <div className="ai-editor-tools-page__content">
        <KoutuUploadPanel onUploadFiles={handleUploadFiles} />
      </div>

      <LoginModal />
    </div>
  )
}
