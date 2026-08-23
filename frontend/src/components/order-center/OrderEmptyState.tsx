export function OrderEmptyState({ text }: { text: string }) {
  return (
    <div className="order-empty">
      <svg className="order-empty__art" viewBox="0 0 220 160" fill="none" aria-hidden>
        <ellipse cx="110" cy="142" rx="58" ry="10" fill="#E8ECF2" />
        <path d="M70 118c8-28 28-46 40-46s32 18 40 46" fill="#D5DBE4" />
        <path d="M78 78h64l10 42H68l10-42Z" fill="#C9B08B" />
        <path d="M78 78h64l-6 18H84L78 78Z" fill="#DCC6A0" />
        <path d="M92 78V58h36v20" stroke="#B8956A" strokeWidth="3" />
        <rect x="98" y="46" width="24" height="16" rx="2" fill="#C9B08B" stroke="#B8956A" strokeWidth="2" />
        <path d="M108 96c-10 2-16 14-12 24 3 8 14 12 24 8" stroke="#8B6A42" strokeWidth="3" fill="none" />
        <path d="M86 120c8 10 18 16 24 16" stroke="#5C6B80" strokeWidth="6" strokeLinecap="round" />
        <path d="M134 120c-8 10-18 16-24 16" stroke="#5C6B80" strokeWidth="6" strokeLinecap="round" />
        <circle cx="158" cy="42" r="16" fill="#E8ECF2" />
        <text x="158" y="48" textAnchor="middle" fontSize="18" fontWeight="700" fill="#9AA3B2">
          ?
        </text>
      </svg>
      <p>{text}</p>
    </div>
  )
}
