import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMessageCenterIndex } from '@/hooks/useMessageCenter'
import { cn } from '@/utils'
import '@/styles/notification-bell.css'

export function NotificationBell({ className }: { className?: string }) {
  const { isLoggedIn } = useAuth()
  const { data } = useMessageCenterIndex(isLoggedIn)
  const unreadCount = data?.unreadCount ?? 0
  const badge = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <Link
      to="/message-center"
      className={cn('notification-bell', className)}
      aria-label={unreadCount > 0 ? `消息，${unreadCount}条未读` : '消息'}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? <span className="notification-bell__badge">{badge}</span> : null}
    </Link>
  )
}
