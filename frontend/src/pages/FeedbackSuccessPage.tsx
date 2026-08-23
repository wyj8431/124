import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, ChevronRight, Gift, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { feedbackApi } from '@/api'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { cn } from '@/utils'

function ProgressSteps({ steps }: { steps: { step: number; label: string; status: string }[] }) {
  const lastDoneIndex = steps.reduce(
    (acc, step, index) => (step.status === 'done' ? index : acc),
    -1,
  )
  const progressWidth =
    steps.length <= 1 || lastDoneIndex <= 0
      ? '0%'
      : `${(lastDoneIndex / (steps.length - 1)) * 100}%`

  return (
    <div className="feedback-success__progress">
      <div className="feedback-success__progress-track" aria-hidden>
        <div className="feedback-success__progress-track-bg" />
        <div className="feedback-success__progress-track-fill" style={{ width: progressWidth }} />
      </div>

      <div className="feedback-success__progress-nodes">
        {steps.map((item) => (
          <div key={item.step} className="feedback-success__progress-node">
            <div
              className={cn(
                'feedback-success__progress-dot',
                item.status === 'done' && 'feedback-success__progress-dot--done',
                item.status === 'active' && 'feedback-success__progress-dot--active',
              )}
            >
              {item.status === 'done' ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <span>{item.step}</span>
              )}
            </div>
            <span
              className={cn(
                'feedback-success__progress-label',
                item.status === 'done' && 'feedback-success__progress-label--done',
                item.status === 'active' && 'feedback-success__progress-label--active',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FeedbackSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const submissionId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feedbackSuccess', submissionId],
    queryFn: () => feedbackApi.getSuccess(submissionId),
    enabled: Number.isFinite(submissionId) && submissionId > 0,
    staleTime: 300_000,
  })

  const homeLink = data?.homeLinkUrl ?? '/'
  const homeText = data?.homeButtonText ?? '返回首页'

  if (!Number.isFinite(submissionId) || submissionId <= 0) {
    return (
      <div className="feedback-success">
        <div className="feedback-success__shell">
          <div className="feedback-success__card feedback-success__card--loading">无效的反馈记录</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="feedback-success">
        <div className="feedback-success__shell">
          <div className="feedback-success__card feedback-success__card--loading">加载中...</div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="feedback-success">
        <div className="feedback-success__shell">
          <div className="feedback-success__card feedback-success__card--loading">加载失败，请刷新重试</div>
        </div>
      </div>
    )
  }

  const stepsWithActive = data.steps.map((step, index) => ({
    ...step,
    status: step.status === 'pending' && index === data.steps.findIndex((s) => s.status === 'pending')
      ? 'active'
      : step.status,
  }))

  return (
    <div className="feedback-success">
      <div className="feedback-success__bg-decor" aria-hidden>
        <span className="feedback-success__blob feedback-success__blob--1" />
        <span className="feedback-success__blob feedback-success__blob--2" />
        <span className="feedback-success__blob feedback-success__blob--3" />
      </div>

      <header className="feedback-success__header">
        <Link to={homeLink} className="feedback-success__brand">
          <PlatformLogo className="h-8 w-8 shadow-sm ring-1 ring-[#ffd660]/45" />
          <span>灵图工坊</span>
        </Link>
        <Link to={homeLink} className="feedback-success__home-link">
          <ArrowLeft className="h-4 w-4" />
          <span>{homeText}</span>
        </Link>
      </header>

      <div className="feedback-success__shell">
        <div className="feedback-success__card">
          <div className="feedback-success__icon-wrap">
            <div className="feedback-success__icon-ring" />
            <div className="feedback-success__icon">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="feedback-success__title">{data.successTitle}</h1>
          <p className="feedback-success__subtitle">{data.successSubtitle}</p>

          <ProgressSteps steps={stepsWithActive} />

          <div className="feedback-success__reward">
            <div className="feedback-success__reward-icon">
              <Gift className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div className="feedback-success__reward-copy">
              <p className="feedback-success__reward-lead">{data.rewardTitle}</p>
              <p className="feedback-success__reward-main">
                {data.rewardSubtitle.replace(/\s*>$/, '')}
                <ChevronRight className="inline h-4 w-4 align-[-2px]" />
              </p>
            </div>
            <Sparkles className="feedback-success__reward-sparkle" aria-hidden />
          </div>

          <div className="feedback-success__actions">
            <Link to={data.claimLinkUrl} className="feedback-success__btn feedback-success__btn--primary">
              {data.claimButtonText}
            </Link>
            <Link to={homeLink} className="feedback-success__btn feedback-success__btn--ghost">
              {homeText}
            </Link>
          </div>
        </div>

        <p className="feedback-success__footnote">您的反馈对我们非常重要，感谢支持灵图工坊</p>
      </div>
    </div>
  )
}
