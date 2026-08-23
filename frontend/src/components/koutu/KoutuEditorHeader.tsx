import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Flag, MessageSquarePlus, UsersRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { KOUTU_COMMUNITY_QR } from '@/data/koutuPageData'

interface KoutuEditorHeaderProps {
  onUploadClick: () => void
}

export function KoutuEditorHeader({ onUploadClick }: KoutuEditorHeaderProps) {
  const navigate = useNavigate()
  const { isLoggedIn, user, setShowLoginModal } = useAuth()

  return (
    <header className="koutu-tools-header">
      <div className="koutu-tools-header__left">
        <Link to="/" className="koutu-tools-header__home-link">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>返回首页</span>
        </Link>
        <span className="koutu-tools-header__divider" aria-hidden />
        <Link to="/" className="koutu-tools-header__logo" aria-label="AI画匠首页">
          AI画匠
        </Link>
        <span className="koutu-tools-header__divider" aria-hidden />
        <span className="koutu-tools-header__tool-name">AI抠图</span>
      </div>

      <div className="koutu-tools-header__right">
        <button type="button" className="koutu-tools-header__icon-btn" title="提建议">
          <MessageSquarePlus aria-hidden />
          <span className="sr-only">提建议</span>
        </button>
        <button type="button" className="koutu-tools-header__icon-btn" title="举报">
          <Flag aria-hidden />
          <span className="sr-only">举报</span>
        </button>

        <div className="koutu-tools-header__community">
          <button type="button" className="koutu-tools-header__icon-btn" title="加入社群">
            <UsersRound aria-hidden />
            <span className="sr-only">加入社群</span>
          </button>
          <div className="koutu-tools-header__community-popover">
            <div className="koutu-tools-header__community-title">创客贴AI创作交流群</div>
            <div className="koutu-tools-header__community-desc">扫描二维码加入</div>
            <img src={KOUTU_COMMUNITY_QR} alt="社群二维码" />
          </div>
        </div>

        <button
          type="button"
          className="koutu-tools-header__action-btn koutu-tools-header__action-btn--vip"
          onClick={() => navigate('/price/vip')}
        >
          升级会员
        </button>
        <button type="button" className="koutu-tools-header__action-btn">
          功能传送
        </button>
        <button type="button" className="koutu-tools-header__action-btn" onClick={onUploadClick}>
          上传图片
        </button>

        {isLoggedIn && user ? (
          <div className="koutu-tools-header__user" title={user.nickname || user.username}>
            <img src={user.avatar || '/default-avatar.png'} alt="" />
            <span className="truncate">{user.nickname || user.username}</span>
          </div>
        ) : (
          <button
            type="button"
            className="koutu-tools-header__login-btn"
            onClick={() => setShowLoginModal(true)}
          >
            登录/注册
          </button>
        )}
      </div>
    </header>
  )
}
