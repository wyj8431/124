import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function canAccess(user: { systemRole?: string; permissions?: string[] } | null, permission: string) {
  if (!user) return false
  if (user.systemRole === 'admin') return true
  return user.permissions?.includes(permission) ?? false
}

export function PermissionGate({ permission, children }: { permission: string; children: ReactNode }) {
  const { isLoggedIn, user, setShowLoginModal } = useAuth()
  const location = useLocation()
  const isDesignShare = permission === 'design:edit' && new URLSearchParams(location.search).has('shareToken')

  useEffect(() => {
    if (!isLoggedIn && !isDesignShare) setShowLoginModal(true)
  }, [isDesignShare, isLoggedIn, setShowLoginModal])

  if (!isLoggedIn && !isDesignShare) {
    return (
      <div className="flex min-h-[320px] items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="m-0 text-sm text-[#505a71]">请登录后继续</p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-[#0773fc] hover:underline"
            onClick={() => setShowLoginModal(true)}
          >
            打开登录窗口
          </button>
        </div>
      </div>
    )
  }
  if (isDesignShare && !isLoggedIn) return <>{children}</>
  if (!canAccess(user, permission)) {
    return (
      <div className="flex min-h-[320px] items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="m-0 text-sm text-[#505a71]">当前账号暂无访问权限</p>
          <Link className="mt-3 inline-block text-sm font-medium text-[#0773fc] hover:underline" to="/">
            返回首页
          </Link>
        </div>
      </div>
    )
  }
  return children
}
