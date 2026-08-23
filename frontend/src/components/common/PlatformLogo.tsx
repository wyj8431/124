import platformLogo from '@/assets/brand/platform-logo.png'
import { cn } from '@/utils'

interface PlatformLogoProps {
  className?: string
}

export function PlatformLogo({ className }: PlatformLogoProps) {
  return (
    <img
      src={platformLogo}
      alt=""
      className={cn('shrink-0 rounded-full object-cover', className)}
    />
  )
}
