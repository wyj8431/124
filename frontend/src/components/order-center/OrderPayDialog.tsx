import type { OrderCenterOrder } from '@/types/orderCenter'

interface Props {
  order: OrderCenterOrder
  paying?: boolean
  onClose: () => void
  onPay: () => Promise<void>
}

export function OrderPayDialog({ order, paying, onClose, onPay }: Props) {
  return (
    <div className="order-pay-mask" onClick={onClose}>
      <div className="order-pay-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>扫码支付</h3>
        <p className="order-pay-dialog__product">{order.productName}</p>
        <p className="order-pay-dialog__amount">{order.amountLabel}</p>
        {order.qrCodeUrl ? (
          <img src={order.qrCodeUrl} alt="支付二维码" className="order-pay-dialog__qr" />
        ) : null}
        <p className="order-pay-dialog__tip">{order.payMethodLabel || '请使用支付宝/微信扫码'} · 演示环境可模拟支付</p>
        <div className="order-pay-dialog__actions">
          <button type="button" className="order-btn" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="order-btn order-btn--primary"
            disabled={paying}
            onClick={() => {
              void onPay()
            }}
          >
            {paying ? '支付中...' : '模拟支付成功'}
          </button>
        </div>
      </div>
    </div>
  )
}
