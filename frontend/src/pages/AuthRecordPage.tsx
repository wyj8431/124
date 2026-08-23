import { useEffect, useState } from 'react'
import { LoginModal } from '@/components/auth/LoginModal'
import { OrderCenterHeader } from '@/components/order-center/OrderCenterHeader'
import {
  AuthRecordBatchBar,
  AuthRecordEmpty,
  AuthRecordFooter,
  AuthRecordGrid,
  AuthRecordToolbar,
} from '@/components/auth-record/AuthRecordParts'
import { useAuth } from '@/context/AuthContext'
import {
  downloadCertFiles,
  useAuthRecordBatchDownload,
  useAuthRecordIndex,
  useAuthRecordList,
} from '@/hooks/useAuthRecord'

export function AuthRecordPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { data: indexData, isLoading: indexLoading, isError: indexError } = useAuthRecordIndex(isLoggedIn)
  const listQuery = useAuthRecordList({ keyword, startDate, endDate }, isLoggedIn && !!indexData)
  const batchDownload = useAuthRecordBatchDownload()

  useEffect(() => {
    if (!isLoggedIn) setShowLoginModal(true)
  }, [isLoggedIn, setShowLoginModal])

  useEffect(() => {
    if (indexData) {
      setStartDate(indexData.defaultStartDate)
      setEndDate(indexData.defaultEndDate)
    }
  }, [indexData])

  const items = listQuery.data?.list ?? []
  const authorizedCount = listQuery.data?.authorizedCount ?? 0

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    if (!batchMode) setBatchMode(true)
  }

  const handleDownloadOne = async (id: number) => {
    const result = await batchDownload.mutateAsync({ ids: [id], latestOnly: true })
    downloadCertFiles(result.files)
  }

  const handleBatchDownload = async () => {
    const result = await batchDownload.mutateAsync({ ids: selectedIds, latestOnly: true })
    downloadCertFiles(result.files)
  }

  const showBatchBar = batchMode || selectedIds.length > 0

  const pageTitle = indexData?.pageTitle ?? '设计授权记录'

  return (
    <div className="auth-record-page">
      <OrderCenterHeader />
      <div className="auth-record-page__content">
        {!isLoggedIn ? (
          <div className="auth-record-login">
            <h2>登录后查看授权记录</h2>
            <p>会员下载设计作品后，可在此查看并下载商用授权书</p>
            <button type="button" className="order-btn order-btn--primary" onClick={() => setShowLoginModal(true)}>
              立即登录
            </button>
          </div>
        ) : indexError ? (
          <div className="auth-record-login">加载失败，请刷新重试</div>
        ) : indexLoading || !indexData ? (
          <div className="auth-record-login">加载中...</div>
        ) : (
          <>
            <h1 className="auth-record-page__title">{pageTitle}</h1>
            <section className="auth-record-panel">
              <AuthRecordToolbar
                count={authorizedCount}
                keyword={keywordInput}
                startDate={startDate}
                endDate={endDate}
                searchPlaceholder={indexData.searchPlaceholder}
                onKeywordChange={setKeywordInput}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onSearch={() => setKeyword(keywordInput.trim())}
              />
              {listQuery.isLoading ? (
                <div className="auth-record-loading">加载中...</div>
              ) : items.length === 0 ? (
                <AuthRecordEmpty text={indexData.emptyText} />
              ) : (
                <AuthRecordGrid
                  items={items}
                  batchMode={batchMode}
                  selectedIds={selectedIds}
                  onToggle={toggleSelect}
                  onDownload={(id) => {
                    void handleDownloadOne(id)
                  }}
                />
              )}
            </section>
          </>
        )}
      </div>

      {showBatchBar && indexData ? (
        <AuthRecordBatchBar
          selectedCount={selectedIds.length}
          batchDownloadText={indexData.batchDownloadText}
          batchDownloadTip={indexData.batchDownloadTip}
          downloading={batchDownload.isPending}
          onBatchDownload={() => {
            void handleBatchDownload()
          }}
          onCancel={() => {
            setBatchMode(false)
            setSelectedIds([])
          }}
        />
      ) : null}

      <AuthRecordFooter />
      <LoginModal />
    </div>
  )
}
