import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, ChevronRight, Info, Gift } from 'lucide-react'
import { useTeamUpgradeModal } from '@/context/TeamUpgradeModalContext'
import { useTeamUpgradeModalData, useTeamUpgradeSubmit } from '@/hooks/useTeamUpgrade'
import { cn } from '@/utils'

const TAG_COLORS = ['#0773fc', '#5cadff', '#36cfc9']

export function TeamUpgradeModal() {
  const navigate = useNavigate()
  const { isOpen, closeTeamUpgradeModal } = useTeamUpgradeModal()
  const { data, isLoading } = useTeamUpgradeModalData(isOpen)
  const submitMutation = useTeamUpgradeSubmit()
  const [sizeCode, setSizeCode] = useState('')

  useEffect(() => {
    if (data?.sizeOptions?.length && !sizeCode) {
      setSizeCode(data.sizeOptions[0].code)
    }
  }, [data, sizeCode])

  useEffect(() => {
    if (!isOpen) {
      setSizeCode('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!sizeCode) return
    try {
      const result = await submitMutation.mutateAsync({ sizeCode })
      closeTeamUpgradeModal()
      navigate(result.redirectPath || '/designtools/enterprise/accountOverview')
    } catch {
      // error surfaced by mutation if needed
    }
  }

  const preview = data?.userPreview

  return (
    <div className="team-upgrade-overlay" onClick={closeTeamUpgradeModal}>
      <div className="team-upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="team-upgrade-modal__close"
          onClick={closeTeamUpgradeModal}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        <aside className="team-upgrade-modal__left">
          {isLoading || !data ? (
            <div className="team-upgrade-modal__left-loading" />
          ) : (
            <>
              <div className="team-upgrade-modal__collage">
                <div className="team-upgrade-modal__collage-head">
                  <h3 className="team-upgrade-modal__collage-title">{data.leftPanel.title}</h3>
                  <div className="team-upgrade-modal__tags">
                    {data.leftPanel.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className="team-upgrade-modal__tag"
                        style={{ background: TAG_COLORS[index % TAG_COLORS.length] }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="team-upgrade-modal__collage-grid">
                  {data.leftPanel.collage.map((url, index) => (
                    <img key={`${url}-${index}`} src={url} alt="" loading="lazy" />
                  ))}
                </div>
              </div>

              <div className="team-upgrade-modal__features">
                {data.leftPanel.features.map((feature) => (
                  <div key={feature.title} className="team-upgrade-modal__feature">
                    <h4>{feature.title}</h4>
                    <p>{feature.subtitle}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        <section className="team-upgrade-modal__right">
          {isLoading || !data ? (
            <div className="team-upgrade-modal__right-loading" />
          ) : (
            <>
              <h2 className="team-upgrade-modal__title">{data.formTitle}</h2>

              <div className="team-upgrade-modal__flow">
                <div className="team-upgrade-modal__account team-upgrade-modal__account--personal">
                  <div className="team-upgrade-modal__avatar team-upgrade-modal__avatar--personal">
                    {preview?.avatar ? (
                      <img src={preview.avatar} alt="" />
                    ) : (
                      <User className="h-5 w-5 text-[#9aa3b2]" strokeWidth={1.8} />
                    )}
                  </div>
                  <p className="team-upgrade-modal__account-name">{preview?.maskedAccount ?? '——'}</p>
                  <span className="team-upgrade-modal__account-badge team-upgrade-modal__account-badge--gray">
                    {data.personalLabel}
                  </span>
                </div>

                <ChevronRight className="team-upgrade-modal__arrow" strokeWidth={2} />

                <div className="team-upgrade-modal__account team-upgrade-modal__account--team">
                  <div className="team-upgrade-modal__avatar team-upgrade-modal__avatar--team">
                    {preview?.teamAvatarText ?? '1'}
                  </div>
                  <p className="team-upgrade-modal__account-name team-upgrade-modal__account-name--team">
                    {preview?.teamName ?? '我的团队'}
                    <Info className="team-upgrade-modal__info-icon" strokeWidth={2} />
                  </p>
                  <span className="team-upgrade-modal__account-badge team-upgrade-modal__account-badge--blue">
                    {data.teamLabel}
                  </span>
                </div>
              </div>

              <div className="team-upgrade-modal__form">
                <label className="team-upgrade-modal__label">
                  <span className="team-upgrade-modal__required">*</span>
                  {data.sizeLabel.replace(/^\*\s*/, '')}
                </label>
                <div className="team-upgrade-modal__size-options">
                  {data.sizeOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={cn(
                        'team-upgrade-modal__size-option',
                        sizeCode === option.code && 'team-upgrade-modal__size-option--active',
                      )}
                      onClick={() => setSizeCode(option.code)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="team-upgrade-modal__submit-wrap">
                <span className="team-upgrade-modal__cta-badge">
                  <Gift className="h-3 w-3" strokeWidth={2.2} />
                  {data.ctaBadge}
                </span>
                <button
                  type="button"
                  className="team-upgrade-modal__submit"
                  disabled={!sizeCode || submitMutation.isPending}
                  onClick={handleSubmit}
                >
                  {submitMutation.isPending ? '升级中...' : data.ctaText}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
