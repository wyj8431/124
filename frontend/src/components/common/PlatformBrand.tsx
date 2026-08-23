import { Link } from 'react-router-dom'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { cn } from '@/utils'

interface PlatformBrandProps {
  className?: string
  logoClassName?: string
}

export function PlatformBrand({ className, logoClassName }: PlatformBrandProps) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2 no-underline', className)}>
      <PlatformLogo className={cn('h-9 w-9', logoClassName)} />
      <span className="text-base font-semibold text-[#1b2337]">灵图工坊</span>
    </Link>
  )
}
