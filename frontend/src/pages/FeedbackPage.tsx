import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bug,
  LayoutTemplate,
  MessageSquare,
  Palette,
  Send,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { feedbackApi } from '@/api'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { cn } from '@/utils'

const typeIcons: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  material: LayoutTemplate,
  design: Palette,
  bug: Bug,
  other: MessageSquare,
}

function splitOptionLabel(label: string) {
  const idx = label.search(/[:：]/)
  if (idx === -1) return { title: label, desc: '' }
  return {
    title: label.slice(0, idx).trim(),
    desc: label.slice(idx + 1).trim(),
  }
}

export function FeedbackPage() {
  const navigate = useNavigate()
  const [typeCode, setTypeCode] = useState('')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feedbackIndex'],
    queryFn: feedbackApi.getIndex,
    staleTime: 300_000,
  })

  const submitMutation = useMutation({
    mutationFn: feedbackApi.submit,
    onSuccess: (result) => {
      navigate(result.redirectPath)
    },
    onError: (err: Error) => {
      setError(err.message || '提交失败，请稍后重试')
    },
  })

  const handleSubmit = () => {
    setError('')
    if (!typeCode) {
      setError('请选择问题类型')
      return
    }
    if (!feedbackContent.trim()) {
      setError('请填写反馈意见')
      return
    }
    submitMutation.mutate({
      feedbackTypeCode: typeCode,
      feedbackContent: feedbackContent.trim(),
    })
  }

  const homeLink = data?.homeLinkUrl ?? '/'
  const homeText = data?.homeButtonText ?? '返回首页'

  if (isLoading) {
    return (
      <div className="feedback-page">
        <div className="feedback-page__shell">
          <div className="feedback-page__card feedback-page__card--loading">加载中...</div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="feedback-page">
        <div className="feedback-page__shell">
          <div className="feedback-page__card feedback-page__card--loading">加载失败，请刷新重试</div>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-page">
      <div className="feedback-page__bg-decor" aria-hidden>
        <span className="feedback-page__blob feedback-page__blob--1" />
        <span className="feedback-page__blob feedback-page__blob--2" />
        <span className="feedback-page__blob feedback-page__blob--3" />
      </div>

      <header className="feedback-page__header">
        <Link to={homeLink} className="feedback-page__brand">
          <PlatformLogo className="h-8 w-8 shadow-sm ring-1 ring-[#ffd660]/45" />
          <span>灵图工坊</span>
        </Link>
        <Link to={homeLink} className="feedback-page__home-link">
          <ArrowLeft className="h-4 w-4" />
          <span>{homeText}</span>
        </Link>
      </header>

      <div className="feedback-page__shell">
        <div className="feedback-page__card">
          <div className="feedback-page__hero">
            <div className="feedback-page__hero-icon">
              <MessageSquare className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="feedback-page__hero-tag">用户反馈</p>
              <h1 className="feedback-page__title">{data.pageTitle}</h1>
            </div>
          </div>

          <div className="feedback-page__intro-box">
            <p>{data.introText}</p>
          </div>

          <section className="feedback-page__section">
            <div className="feedback-page__section-head">
              <span className="feedback-page__section-no">01</span>
              <div>
                <h2 className="feedback-page__section-title">
                  {data.typeQuestionLabel}
                  <span className="feedback-page__required">必填</span>
                </h2>
                <p className="feedback-page__section-desc">请选择最符合您反馈内容的类型</p>
              </div>
            </div>

            <div className="feedback-page__option-grid">
              {data.typeOptions.map((option) => {
                const Icon = typeIcons[option.code] ?? MessageSquare
                const { title, desc } = splitOptionLabel(option.label)
                const active = typeCode === option.code

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={cn('feedback-page__option-card', active && 'feedback-page__option-card--active')}
                    onClick={() => setTypeCode(option.code)}
                  >
                    <span className="feedback-page__option-icon">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="feedback-page__option-copy">
                      <span className="feedback-page__option-title">{title}</span>
                      {desc ? <span className="feedback-page__option-desc">{desc}</span> : null}
                    </span>
                    <span className={cn('feedback-page__option-check', active && 'feedback-page__option-check--on')} />
                  </button>
                )
              })}
            </div>
          </section>

          <section className="feedback-page__section">
            <div className="feedback-page__section-head">
              <span className="feedback-page__section-no">02</span>
              <div>
                <h2 className="feedback-page__section-title">
                  {data.feedbackContentLabel ?? '反馈意见填写'}
                  <span className="feedback-page__required">必填</span>
                </h2>
                <p className="feedback-page__section-desc">
                  {data.feedbackContentDesc ?? '请详细描述您遇到的问题、建议或使用体验'}
                </p>
              </div>
            </div>

            <div className="feedback-page__contact-box">
              <textarea
                className="feedback-page__textarea feedback-page__textarea--content"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                rows={6}
                placeholder={data.feedbackContentPlaceholder ?? '请输入您的反馈意见…'}
              />
              <p className="feedback-page__char-count">{feedbackContent.length} 字</p>
            </div>
          </section>

          {error ? <p className="feedback-page__error">{error}</p> : null}

          <button
            type="button"
            className="feedback-page__submit"
            disabled={submitMutation.isPending}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            {submitMutation.isPending ? '提交中...' : data.submitButtonText}
          </button>
        </div>

        <p className="feedback-page__footnote">填写完成后有机会获得会员福利，感谢您的支持</p>
      </div>
    </div>
  )
}
