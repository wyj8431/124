export interface AuthRecordIndexData {
  pageTitle: string
  emptyText: string
  searchPlaceholder: string
  batchDownloadText: string
  batchDownloadTip: string
  defaultStartDate: string
  defaultEndDate: string
}

export interface AuthRecordItem {
  id: number
  designId: number
  authNo: string
  designTitle: string
  coverUrl?: string
  authType: string
  authTypeLabel: string
  licenseHolder: string
  licenseNo: string
  sizeLabel: string
  authTime: string
  certVersion: number
  latestCert: boolean
}

export interface AuthRecordListResult {
  total: number
  authorizedCount: number
  list: AuthRecordItem[]
}

export interface AuthRecordCertFile {
  id: number
  authNo: string
  fileName: string
  contentType: string
  content: string
}

export interface AuthRecordBatchDownloadResult {
  count: number
  files: AuthRecordCertFile[]
}
