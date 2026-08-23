import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderCenterApi } from '@/api'

export function useOrderCenterIndex(enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'index'],
    queryFn: orderCenterApi.getIndex,
    enabled,
    staleTime: 60_000,
  })
}

export function useOrderCenterOrders(type: string, status: string, enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'orders', type, status],
    queryFn: () => orderCenterApi.listOrders({ type, status, page: 1, pageSize: 50 }),
    enabled,
  })
}

export function useEligibleInvoices(enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'eligible'],
    queryFn: orderCenterApi.listEligible,
    enabled,
  })
}

export function useInvoiceHistory(enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'invoices'],
    queryFn: () => orderCenterApi.listInvoices(1, 50),
    enabled,
  })
}

export function useTransfers(enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'transfers'],
    queryFn: () => orderCenterApi.listTransfers(1, 50),
    enabled,
  })
}

export function useBalance(tab: string, enabled = true) {
  return useQuery({
    queryKey: ['orderCenter', 'balance', tab],
    queryFn: () => orderCenterApi.getBalance(tab),
    enabled,
  })
}

export function useOrderCenterActions() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['orderCenter'] })
    qc.invalidateQueries({ queryKey: ['accountPanel'] })
  }

  const pay = useMutation({
    mutationFn: orderCenterApi.payOrder,
    onSettled: invalidate,
  })
  const cancel = useMutation({
    mutationFn: orderCenterApi.cancelOrder,
    onSettled: invalidate,
  })
  const applyInvoice = useMutation({
    mutationFn: orderCenterApi.applyInvoice,
    onSettled: invalidate,
  })
  const submitTransfer = useMutation({
    mutationFn: orderCenterApi.submitTransfer,
    onSettled: invalidate,
  })

  return { pay, cancel, applyInvoice, submitTransfer }
}
