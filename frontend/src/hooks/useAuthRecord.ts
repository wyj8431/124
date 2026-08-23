import { useMutation, useQuery } from '@tanstack/react-query'
import { authRecordApi } from '@/api'

export function useAuthRecordIndex(enabled = true) {
  return useQuery({
    queryKey: ['authRecord', 'index'],
    queryFn: authRecordApi.getIndex,
    enabled,
    staleTime: 60_000,
  })
}

export function useAuthRecordList(
  params: { keyword: string; startDate: string; endDate: string },
  enabled = true,
) {
  return useQuery({
    queryKey: ['authRecord', 'list', params],
    queryFn: () =>
      authRecordApi.listRecords({
        keyword: params.keyword || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        page: 1,
        pageSize: 48,
      }),
    enabled,
  })
}

export function useAuthRecordBatchDownload() {
  return useMutation({
    mutationFn: authRecordApi.batchDownload,
  })
}

export function downloadCertFiles(files: import('@/types/authRecord').AuthRecordCertFile[]) {
  for (const file of files) {
    const blob = new Blob([file.content], { type: file.contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName
    link.click()
    URL.revokeObjectURL(url)
  }
}
