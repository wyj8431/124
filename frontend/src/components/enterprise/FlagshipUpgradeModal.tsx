import { useMemo } from 'react'
import { X } from 'lucide-react'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { useFlagshipUpgradeModal } from '@/context/FlagshipUpgradeModalContext'

export function FlagshipUpgradeModal() {
  const { isOpen, closeFlagshipUpgradeModal } = useFlagshipUpgradeModal()

  const qrUrl = useMemo(
    () =>
      'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=chuangkit-flagship-consult&margin=0',
    [],
  )

  if (!isOpen) return null

  return (
    <div className="flagship-upgrade-overlay" onClick={closeFlagshipUpgradeModal}>
      <div className="flagship-upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="flagship-upgrade-modal__close"
          onClick={closeFlagshipUpgradeModal}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="flagship-upgrade-modal__title">温馨提示</h2>
        <p className="flagship-upgrade-modal__desc">升级旗舰版，可扫码联系顾问续费或咨询</p>

        <div className="flagship-upgrade-modal__qr-wrap">
          <img src={qrUrl} alt="联系顾问二维码" className="flagship-upgrade-modal__qr" />
          <div className="flagship-upgrade-modal__qr-logo" aria-hidden="true">
            <PlatformLogo className="h-11 w-11" />
          </div>
        </div>

        <button type="button" className="flagship-upgrade-modal__confirm" onClick={closeFlagshipUpgradeModal}>
          我知道了
        </button>
      </div>
    </div>
  )
}
