import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  Building2,
  ChevronRight,
  CircleHelp,
  Crown,
  Download,
  Minus,
  Plus,
  Shield,
  Sparkles,
  LayoutTemplate,
  X,
  Zap,
} from 'lucide-react'
import { memberApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useMembershipModal } from '@/context/MembershipModalContext'
import type { MemberOrderData, MembershipSku, MembershipTier } from '@/types/membership'
import { cn } from '@/utils'

const benefitThemes: Record<string, string> = {
  shield: 'gold',
  template: 'blue',
  agent: 'purple',
  ai: 'cyan',
  points: 'orange',
  download: 'green',
}

const benefitIcons: Record<string, typeof Shield> = {
  shield: Shield,
  template: LayoutTemplate,
  agent: Bot,
  ai: Sparkles,
  points: Sparkles,
  download: Download,
}

function PayAlipayIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill={active ? '#1677FF' : '#E8E8E8'} />
      <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">支</text>
    </svg>
  )
}

function PayWechatIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill={active ? '#07C160' : '#E8E8E8'} />
      <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">微</text>
    </svg>
  )
}

export function MembershipModal() {
  const { isOpen, closeMembershipModal, initialGroup, initialTier } = useMembershipModal()
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const queryClient = useQueryClient()
  const appliedInitialRef = useRef(false)

  const [groupCode, setGroupCode] = useState<'individual' | 'team'>('individual')
  const [tierCode, setTierCode] = useState('')
  const [skuId, setSkuId] = useState<number | null>(null)
  const [seatCount, setSeatCount] = useState(2)
  const [payMethod, setPayMethod] = useState<'alipay' | 'wechat'>('alipay')
  const [paid, setPaid] = useState(false)
  const [activeOrder, setActiveOrder] = useState<MemberOrderData | null>(null)
  const [orderError, setOrderError] = useState(false)
  const [orderPending, setOrderPending] = useState(false)
  const pollingOrderIdRef = useRef<number | null>(null)
  const orderSeqRef = useRef(0)
  const activeOrderKeyRef = useRef('')

  const { data: checkout, isLoading } = useQuery({
    queryKey: ['membershipCheckout'],
    queryFn: memberApi.getCheckoutIndex,
    enabled: isOpen && isLoggedIn,
    staleTime: 60_000,
  })

  const simulatePay = useMutation({
    mutationFn: memberApi.simulatePay,
    onSuccess: () => {
      setPaid(true)
      pollingOrderIdRef.current = null
      queryClient.invalidateQueries({ queryKey: ['accountPanel'] })
      queryClient.invalidateQueries({ queryKey: ['membershipCheckout'] })
      queryClient.invalidateQueries({ queryKey: ['orderCenter'] })
      setTimeout(() => closeMembershipModal(), 1200)
    },
  })

  const currentGroup = useMemo(
    () => checkout?.groups.find((g) => g.code === groupCode),
    [checkout, groupCode],
  )

  const currentTier = useMemo(
    () => currentGroup?.tiers.find((t) => t.code === tierCode) ?? currentGroup?.tiers[0],
    [currentGroup, tierCode],
  )

  const selectedSku = useMemo(
    () => currentTier?.skus.find((s) => s.id === skuId) ?? currentTier?.skus[0],
    [currentTier, skuId],
  )

  const orderRequest = useMemo(() => {
    if (!selectedSku) return null
    return {
      skuId: selectedSku.id,
      seatCount: groupCode === 'team' ? seatCount : 1,
      payMethod,
    }
  }, [selectedSku, seatCount, payMethod, groupCode])

  const orderRequestKey = orderRequest
    ? `${orderRequest.skuId}-${orderRequest.seatCount}-${orderRequest.payMethod}`
    : ''

  const previewTotal = useMemo(() => {
    if (!selectedSku || !orderRequest) return null
    return selectedSku.price * orderRequest.seatCount
  }, [selectedSku, orderRequest])

  const previewOriginal = useMemo(() => {
    if (!selectedSku?.originalPrice || !orderRequest) return null
    return selectedSku.originalPrice * orderRequest.seatCount
  }, [selectedSku, orderRequest])

  const previewSaved = useMemo(() => {
    if (previewOriginal == null || previewTotal == null) return null
    const saved = previewOriginal - previewTotal
    return saved > 0 ? saved : null
  }, [previewOriginal, previewTotal])

  const orderMatchesRequest = !!activeOrder && activeOrderKeyRef.current === orderRequestKey

  const order = orderMatchesRequest ? activeOrder : undefined
  const orderLoading = orderPending && !order

  const displayPrice = order?.totalPrice ?? previewTotal
  const displayOriginal = order?.originalPrice ?? previewOriginal
  const displaySaved = order?.savedAmount ?? previewSaved

  useEffect(() => {
    if (!isOpen) {
      appliedInitialRef.current = false
      setPaid(false)
      setActiveOrder(null)
      setOrderError(false)
      setOrderPending(false)
      activeOrderKeyRef.current = ''
      pollingOrderIdRef.current = null
      return
    }
    if (!isLoggedIn) {
      setShowLoginModal(true)
    }
  }, [isOpen, isLoggedIn, setShowLoginModal])

  useEffect(() => {
    if (!checkout || !isOpen) return
    setGroupCode(initialGroup ?? 'individual')
    appliedInitialRef.current = false
  }, [checkout, isOpen, initialGroup])

  useEffect(() => {
    if (!currentGroup || !isOpen) return
    if (appliedInitialRef.current) return
    const tier = initialTier
      ? currentGroup.tiers.find((t) => t.code === initialTier) ?? currentGroup.tiers[0]
      : currentGroup.tiers[0]
    if (tier) {
      setTierCode(tier.code)
      setSkuId(tier.skus[0]?.id ?? null)
      if (groupCode === 'team') {
        setSeatCount(Math.max(tier.minSeats, 2))
      }
    }
    appliedInitialRef.current = true
  }, [currentGroup, groupCode, initialTier, isOpen])

  useEffect(() => {
    if (!orderRequest || !isOpen || !isLoggedIn) return
    const seq = ++orderSeqRef.current
    setOrderPending(true)
    setOrderError(false)
    const timer = window.setTimeout(async () => {
      try {
        const data = await memberApi.createOrder(orderRequest)
        if (seq !== orderSeqRef.current) return
        activeOrderKeyRef.current = orderRequestKey
        setActiveOrder(data)
        setOrderError(false)
      } catch {
        if (seq !== orderSeqRef.current) return
        setActiveOrder(null)
        setOrderError(true)
      } finally {
        if (seq === orderSeqRef.current) {
          setOrderPending(false)
        }
      }
    }, 280)
    return () => window.clearTimeout(timer)
  }, [orderRequestKey, isOpen, isLoggedIn, orderRequest])

  useEffect(() => {
    if (!order?.orderId || order.status === 'paid' || !isOpen || paid) return
    pollingOrderIdRef.current = order.orderId
    const pollingFor = order.orderId
    const timer = window.setInterval(async () => {
      if (pollingOrderIdRef.current !== pollingFor) return
      try {
        const status = await memberApi.getOrderStatus(pollingFor)
        if (status.status === 'paid') {
          setPaid(true)
          pollingOrderIdRef.current = null
          queryClient.invalidateQueries({ queryKey: ['accountPanel'] })
          queryClient.invalidateQueries({ queryKey: ['orderCenter'] })
          setTimeout(() => closeMembershipModal(), 1200)
        }
      } catch {
        /* ignore polling errors */
      }
    }, 2500)
    return () => window.clearInterval(timer)
  }, [order?.orderId, order?.status, isOpen, paid, closeMembershipModal, queryClient])

  const activeTierCode = tierCode || currentTier?.code || ''

  const handleGroupChange = (code: 'individual' | 'team') => {
    pollingOrderIdRef.current = null
    activeOrderKeyRef.current = ''
    setActiveOrder(null)
    setGroupCode(code)
    const group = checkout?.groups.find((g) => g.code === code)
    const tier = group?.tiers[0]
    if (tier) {
      setTierCode(tier.code)
      setSkuId(tier.skus[0]?.id ?? null)
      if (code === 'team') {
        setSeatCount(Math.max(tier.minSeats, 2))
      }
    }
  }

  const handleTierChange = (tier: MembershipTier) => {
    pollingOrderIdRef.current = null
    activeOrderKeyRef.current = ''
    setActiveOrder(null)
    setTierCode(tier.code)
    setSkuId(tier.skus[0]?.id ?? null)
  }

  if (!isOpen || !isLoggedIn) return null

  return (
    <div className="membership-modal-overlay" onClick={closeMembershipModal}>
      <div
        className={cn('membership-modal', groupCode === 'team' && 'membership-modal--team')}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="membership-modal__close" onClick={closeMembershipModal} aria-label="关闭">
          <X className="h-4 w-4" />
        </button>

        {isLoading || !checkout ? (
          <div className="membership-modal__loading">
            <span className="membership-modal__loading-ring" />
            加载尊享方案...
          </div>
        ) : (
          <div className="membership-modal__body">
            <div className="membership-modal__left">
              <div className="membership-modal__left-top">
                <div className="membership-modal__hero">
                  <div className="membership-modal__hero-glow" aria-hidden="true" />
                  <div className="membership-modal__header">
                    <div className="membership-modal__user">
                      <div className="membership-modal__avatar-wrap">
                        <img
                          src={checkout.user.avatar || coverFallback(checkout.user.displayName)}
                          alt=""
                          className="membership-modal__avatar"
                        />
                        <span className="membership-modal__avatar-ring" />
                      </div>
                      <div>
                        <div className="membership-modal__user-row">
                          <span className="membership-modal__phone">{checkout.user.displayName}</span>
                          <span className="membership-modal__level">
                            <Crown className="h-3 w-3" />
                            {checkout.user.levelLabel}
                          </span>
                        </div>
                        <p className="membership-modal__slogan">{checkout.user.slogan}</p>
                      </div>
                    </div>
                    <div className="membership-modal__hero-badge">
                      <Zap className="h-3.5 w-3.5" />
                      限时尊享
                    </div>
                  </div>
                </div>

                <div className="membership-modal__group-tabs">
                  {checkout.groups.map((group) => (
                    <button
                      key={group.code}
                      type="button"
                      className={cn(
                        'membership-modal__group-tab',
                        groupCode === group.code && 'membership-modal__group-tab--active',
                      )}
                      onClick={() => handleGroupChange(group.code)}
                    >
                      {group.title}
                      <span className="membership-modal__group-sub">({group.subtitle})</span>
                    </button>
                  ))}
                </div>

                <div className="membership-modal__tier-bar">
                  <div className="membership-modal__tier-tabs">
                    {currentGroup?.tiers.map((tier) => (
                      <button
                        key={tier.code}
                        type="button"
                        className={cn(
                          'membership-modal__tier-tab',
                          activeTierCode === tier.code && 'membership-modal__tier-tab--active',
                        )}
                        onClick={() => handleTierChange(tier)}
                      >
                        {tier.name}
                      </button>
                    ))}
                  </div>

                  {currentTier?.description ? (
                    <p className="membership-modal__tier-desc">{currentTier.description}</p>
                  ) : null}
                </div>
              </div>

              <div className="membership-modal__left-scroll">
                <div className="membership-modal__plan-panel">
                {groupCode === 'team' && currentTier ? (
                  <div className="membership-modal__seats">
                    <span className="membership-modal__seats-label">选择席位数</span>
                    <div className="membership-modal__seats-stepper">
                      <button
                        type="button"
                        onClick={() => setSeatCount((v) => Math.max(currentTier.minSeats, v - 1))}
                        aria-label="减少席位"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span>{seatCount}</span>
                      <button
                        type="button"
                        onClick={() => setSeatCount((v) => Math.min(currentTier.maxSeats, v + 1))}
                        aria-label="增加席位"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="membership-modal__seats-tip">
                      共 {seatCount} 个会员席位，还可邀请 {Math.max(seatCount - 1, 0)} 人
                    </span>
                  </div>
                ) : null}

                <div className="membership-modal__sku-scroll">
                  <div className="membership-modal__sku-row">
                    {currentTier?.skus.map((sku) => (
                      <SkuCard
                        key={sku.id}
                        sku={sku}
                        active={sku.id === (skuId ?? selectedSku?.id)}
                        onSelect={() => {
                          pollingOrderIdRef.current = null
                          activeOrderKeyRef.current = ''
                          setActiveOrder(null)
                          setSkuId(sku.id)
                        }}
                      />
                    ))}
                  </div>
                  {(currentTier?.skus.length ?? 0) > 4 ? (
                    <div className="membership-modal__sku-more" aria-hidden="true">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>

                {order?.validUntilLabel ? (
                  <p className="membership-modal__valid">
                    <span className="membership-modal__valid-dot" />
                    开通后有效期至 <strong>{order.validUntilLabel}</strong>
                  </p>
                ) : null}

                {selectedSku?.autoRenewTip ? (
                  <p className="membership-modal__renew-tip">
                    {selectedSku.autoRenewTip}
                    <CircleHelp className="h-3.5 w-3.5" />
                  </p>
                ) : null}
                </div>

                <div className="membership-modal__benefits">
                <div className="membership-modal__benefits-head">
                  <span className="membership-modal__benefits-title">
                    <Crown className="h-4 w-4" />
                    会员尊享权益
                  </span>
                  <button type="button">查看更多 <ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
                <div className="membership-modal__benefits-grid">
                  {currentTier?.benefits.map((item) => {
                    const Icon = benefitIcons[item.icon] ?? Shield
                    const theme = benefitThemes[item.icon] ?? 'blue'
                    return (
                      <div key={item.title} className="membership-modal__benefit">
                        <span className={cn('membership-modal__benefit-icon-wrap', `membership-modal__benefit-icon-wrap--${theme}`)}>
                          <Icon className="membership-modal__benefit-icon" />
                        </span>
                        <div className="membership-modal__benefit-text">
                          <p className="membership-modal__benefit-title">{item.title}</p>
                          <p className="membership-modal__benefit-desc">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                </div>

                <div className="membership-modal__footer-links">
                  <button type="button">常见问题</button>
                  <button type="button">咨询客服</button>
                </div>
              </div>
            </div>

            <div className="membership-modal__right">
              <div className="membership-modal__right-bg" aria-hidden="true">
                <div className="membership-modal__right-orb membership-modal__right-orb--1" />
                <div className="membership-modal__right-orb membership-modal__right-orb--2" />
              </div>

              <button type="button" className="membership-modal__coupon">
                使用优惠券/码 <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <div className="membership-modal__checkout">
                {(displaySaved ?? 0) > 0 ? (
                  <span className="membership-modal__save-chip">立省 ¥{displaySaved}</span>
                ) : (
                  <span className="membership-modal__save-chip membership-modal__save-chip--hot">热门套餐</span>
                )}

                <div className="membership-modal__price-wrap">
                  {displayOriginal && displaySaved ? (
                    <div className="membership-modal__price-meta">
                      <span className="membership-modal__price-origin">原价 ¥{displayOriginal}</span>
                    </div>
                  ) : null}
                  <div className="membership-modal__price">
                    <span className="membership-modal__price-symbol">¥</span>
                    <span className="membership-modal__price-num">{displayPrice ?? '--'}</span>
                  </div>
                  <p className="membership-modal__price-hint">扫码支付 · 即时开通</p>
                </div>

                <div className="membership-modal__qr-wrap">
                  <div className="membership-modal__qr-frame">
                    {paid ? (
                      <div className="membership-modal__qr-success">
                        <Crown className="h-8 w-8" />
                        开通成功
                      </div>
                    ) : orderLoading ? (
                      <div className="membership-modal__qr-loading">
                        <span className="membership-modal__loading-ring membership-modal__loading-ring--sm" />
                      </div>
                    ) : orderError ? (
                      <div className="membership-modal__qr-error">
                        <p>二维码生成失败</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!orderRequest) return
                            const seq = ++orderSeqRef.current
                            setOrderPending(true)
                            setOrderError(false)
                            memberApi.createOrder(orderRequest)
                              .then((data) => {
                                if (seq !== orderSeqRef.current) return
                                activeOrderKeyRef.current = orderRequestKey
                                setActiveOrder(data)
                              })
                              .catch(() => {
                                if (seq !== orderSeqRef.current) return
                                setOrderError(true)
                              })
                              .finally(() => {
                                if (seq === orderSeqRef.current) setOrderPending(false)
                              })
                          }}
                        >
                          点击重试
                        </button>
                      </div>
                    ) : order?.qrCodeUrl ? (
                      <button
                        type="button"
                        className="membership-modal__qr-btn"
                        title="演示环境：点击模拟扫码支付"
                        onClick={() => order.orderId && simulatePay.mutate(order.orderId)}
                        disabled={simulatePay.isPending}
                      >
                        <img src={order.qrCodeUrl} alt="支付二维码" className="membership-modal__qr" />
                        <span className="membership-modal__qr-scan" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="membership-modal__pay-methods">
                  <button
                    type="button"
                    className={cn(
                      'membership-modal__pay-btn',
                      payMethod === 'alipay' && 'membership-modal__pay-btn--active',
                    )}
                    onClick={() => {
                      pollingOrderIdRef.current = null
                      activeOrderKeyRef.current = ''
                      setActiveOrder(null)
                      setPayMethod('alipay')
                    }}
                  >
                    <PayAlipayIcon active={payMethod === 'alipay'} />
                    支付宝
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'membership-modal__pay-btn',
                      payMethod === 'wechat' && 'membership-modal__pay-btn--active',
                    )}
                    onClick={() => {
                      pollingOrderIdRef.current = null
                      activeOrderKeyRef.current = ''
                      setActiveOrder(null)
                      setPayMethod('wechat')
                    }}
                  >
                    <PayWechatIcon active={payMethod === 'wechat'} />
                    微信
                  </button>
                </div>

                <p className="membership-modal__trust">已有 128 万+ 创作者选择创客贴会员</p>

                <p className="membership-modal__terms">
                  支付即视为您同意《服务协议》与《授权许可》，支付后可在订单中心开具发票
                </p>
              </div>

              <button type="button" className="membership-modal__transfer">
                <Building2 className="h-4 w-4" />
                我要对公转账
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SkuCard({
  sku,
  active,
  onSelect,
}: {
  sku: MembershipSku
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={cn('membership-sku-card', active && 'membership-sku-card--active')}
      onClick={onSelect}
    >
      {active ? <span className="membership-sku-card__glow" aria-hidden="true" /> : null}
      {sku.badgeText ? <span className="membership-sku-card__badge">{sku.badgeText}</span> : null}
      <div className="membership-sku-card__inner">
        <p className="membership-sku-card__name">{sku.name}</p>
        <p className="membership-sku-card__price">
          <span className="membership-sku-card__symbol">¥</span>
          {sku.price}
          {sku.perPerson ? <span className="membership-sku-card__unit">/人</span> : null}
        </p>
        {!sku.footerText && sku.perMonthText ? (
          <p className="membership-sku-card__sub">{sku.perMonthText}</p>
        ) : null}
      </div>
      {sku.footerText ? (
        <span className={cn('membership-sku-card__footer', active && 'membership-sku-card__footer--active')}>
          {sku.footerText}
        </span>
      ) : null}
    </button>
  )
}

function coverFallback(name: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(name)}/64/64`
}
