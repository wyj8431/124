export interface FeedbackTypeOption {
  id: number
  code: string
  label: string
}

export interface FeedbackIndexData {
  pageTitle: string
  introText: string
  typeQuestionLabel: string
  feedbackContentLabel: string
  feedbackContentDesc: string
  feedbackContentPlaceholder: string
  submitButtonText: string
  homeButtonText: string
  homeLinkUrl: string
  typeOptions: FeedbackTypeOption[]
}

export interface FeedbackSubmitResult {
  submissionId: number
  redirectPath: string
}

export interface FeedbackSuccessStep {
  step: number
  label: string
  status: 'done' | 'pending' | 'active'
}

export interface FeedbackSuccessData {
  successTitle: string
  successSubtitle: string
  rewardTitle: string
  rewardSubtitle: string
  claimButtonText: string
  claimLinkUrl: string
  homeButtonText: string
  homeLinkUrl: string
  headerImageUrl: string | null
  steps: FeedbackSuccessStep[]
}
