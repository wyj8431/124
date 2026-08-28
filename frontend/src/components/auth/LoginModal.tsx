import { useState, useMemo, useEffect, useCallback } from 'react'
import { X, Check, Monitor, Smartphone, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/api'
import { PlatformLogo } from '@/components/common/PlatformLogo'
import { PuzzleCaptchaModal } from '@/components/auth/PuzzleCaptchaModal'

const FEATURES = [
  '只需一步极速注册登录',
  '100W+ 优质模板每日更新',
  '1亿+ 版权素材商用无忧',
  'AI智能工具助力轻松创作',
  '一键高清无水印下载',
  '免费在线设计 支持多人协作',
]

const OTHER_LOGINS = [
  { id: 'phone', label: '手机号登录', icon: Smartphone, badge: true },
  { id: 'qq', label: 'QQ', text: 'Q' },
  { id: 'weibo', label: '微博', text: '微' },
  { id: 'dingtalk', label: '钉钉', text: '钉' },
  { id: 'feishu', label: '飞书', text: '飞' },
  { id: 'baidu', label: '百度', text: '百' },
]

type View = 'qrcode' | 'password' | 'register' | 'forgot'

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, loginByWechat, resetPassword } = useAuth()
  const [view, setView] = useState<View>('qrcode')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginHint, setLoginHint] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = useCallback(() => {
    setUsername('')
    setPassword('')
    setLoginHint('')
    setError('')
  }, [])

  const close = () => {
    setShowLoginModal(false)
    setView('qrcode')
    resetForm()
  }

  const goRegister = () => {
    resetForm()
    setView('register')
  }

  const goLogin = () => {
    resetForm()
    setView('password')
  }

  const goForgot = () => {
    resetForm()
    setView('forgot')
  }

  if (!showLoginModal) return null

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
      <div className="relative">
        <button
          onClick={close}
          className="absolute -right-4 -top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-50"
          aria-label="关闭"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        <div className="flex h-[520px] w-[860px] max-w-[95vw] animate-fade-in overflow-hidden rounded-2xl shadow-2xl">
          <BrandPanel />

          <div className="relative flex flex-1 flex-col bg-white">
            {view === 'qrcode' && (
              <>
                <button
                  onClick={goLogin}
                  className="absolute right-6 top-6 z-10 flex items-center gap-1.5 text-xs transition hover:opacity-80"
                >
                  <span className="text-ckt-text-secondary">密码登录在这里</span>
                  <Monitor className="h-5 w-5 text-ckt-primary" />
                </button>
                <div className="flex h-full flex-col overflow-y-auto px-10 pb-6 pt-12">
                  <QrLoginView onPhoneLogin={goLogin} onRegister={goRegister} onWechatLogin={loginByWechat} />
                </div>
              </>
            )}

            {view === 'password' && (
              <>
                <button
                  onClick={() => setView('qrcode')}
                  className="absolute right-6 top-6 z-10 flex items-center gap-1.5 text-xs transition hover:opacity-80"
                >
                  <span className="text-ckt-text-secondary">扫码登录在这里</span>
                  <span className="text-lg">📱</span>
                </button>
                <div className="flex h-full flex-col overflow-y-auto px-10 pb-6 pt-12">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <PasswordLoginView
                      username={username}
                      password={password}
                      error={error}
                      loginHint={loginHint}
                      loading={loading}
                      onUsernameChange={setUsername}
                      onPasswordChange={setPassword}
                      onSubmit={handleLoginSubmit}
                      onSwitchRegister={goRegister}
                      onForgotPassword={goForgot}
                    />
                  </div>
                  <LoginFooter onRegister={goRegister} />
                </div>
              </>
            )}

            {view === 'register' && (
              <RegisterView
                onBack={goLogin}
                onRegistered={(phone) => {
                  setUsername(phone)
                  setPassword('')
                  setError('')
                  setLoginHint('注册成功，请使用手机号和密码登录')
                  setView('password')
                }}
              />
            )}

            {view === 'forgot' && (
              <ForgotPasswordView
                onBack={goLogin}
                onSuccess={resetForm}
                resetPassword={resetPassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <div
      className="relative flex w-[340px] shrink-0 flex-col overflow-hidden px-8 py-8 text-white"
      style={{
        background: 'linear-gradient(160deg, #0066ff 0%, #0052d9 50%, #003eb3 100%)',
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-8 top-1/3 h-32 w-32 rounded-full border border-white/10" />

      <div className="relative flex items-center gap-2">
        <PlatformLogo className="h-9 w-9 shadow-md ring-1 ring-white/30" />
        <span className="text-lg font-semibold tracking-wide">灵图工坊</span>
      </div>

      <div className="relative mt-10">
        <h2 className="text-[28px] font-bold leading-tight tracking-wide">
          让设计
          <br />
          <span className="relative inline-block">
            触手可及！
            <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-[#c8f542] opacity-90" />
          </span>
        </h2>
      </div>

      <ul className="relative mt-8 space-y-3.5">
        {FEATURES.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] leading-snug text-white/90">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoginFooter({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="mt-6 flex shrink-0 items-center justify-between text-[11px] text-gray-400">
      <p>
        登录即同意{' '}
        <a href="#" className="text-ckt-primary hover:underline">用户协议</a>、
        <a href="#" className="text-ckt-primary hover:underline">隐私政策</a>
      </p>
      <button onClick={onRegister} className="shrink-0 text-ckt-primary hover:underline">
        手机号注册
      </button>
    </div>
  )
}

function QrLoginView({
  onPhoneLogin,
  onRegister,
  onWechatLogin,
}: {
  onPhoneLogin: () => void
  onRegister: () => void
  onWechatLogin: (code: string) => Promise<void>
}) {
  const [wechatError, setWechatError] = useState('')
  const [wechatLoading, setWechatLoading] = useState(false)
  const qrUrl = useMemo(
    () => 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=chuangkit-wechat-login',
    [],
  )

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <h3 className="text-xl font-semibold text-ckt-text">微信扫码安全登录</h3>
      <p className="mt-2 text-center text-xs leading-relaxed text-gray-400">
        未在灵图工坊内完成绑定的微信和手机号，是两个独立账号
      </p>

      <div className="relative mt-5 rounded-lg border border-gray-100 p-2.5 shadow-sm">
        <img src={qrUrl} alt="微信扫码登录" className="h-[150px] w-[150px]" />
      </div>

      <button
        type="button"
        className="mt-3 text-xs text-ckt-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        disabled={wechatLoading}
        onClick={async () => {
          setWechatError('')
          setWechatLoading(true)
          try {
            await onWechatLogin('demo-wechat-scan')
          } catch (error) {
            setWechatError(error instanceof Error ? error.message : '微信登录失败')
          } finally {
            setWechatLoading(false)
          }
        }}
      >
        {wechatLoading ? '正在确认扫码...' : '模拟扫码登录'}
      </button>
      {wechatError ? <p role="alert" className="mt-2 text-xs text-red-500">{wechatError}</p> : null}

      <div className="mt-5 w-full">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">其他登录方式</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex items-center justify-center gap-4 pb-1">
          {OTHER_LOGINS.map((item) => (
            <button
              key={item.id}
              onClick={item.id === 'phone' ? onPhoneLogin : undefined}
              className="group relative flex flex-col items-center gap-1"
              title={item.label}
            >
              {item.badge && (
                <span className="absolute -top-5 whitespace-nowrap rounded bg-[#52c41a] px-1.5 py-0.5 text-[10px] text-white">
                  手机号登录
                </span>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-sm text-gray-600 transition group-hover:border-ckt-primary group-hover:text-ckt-primary">
                {item.icon ? (
                  <item.icon className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-medium">{item.text}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <LoginFooter onRegister={onRegister} />
    </div>
  )
}

function PasswordLoginView({
  username,
  password,
  error,
  loginHint,
  loading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onSwitchRegister,
  onForgotPassword,
}: {
  username: string
  password: string
  error: string
  loginHint?: string
  loading: boolean
  onUsernameChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
  onSwitchRegister: () => void
  onForgotPassword: () => void
}) {
  return (
    <div className="w-full max-w-[340px]">
      <h3 className="mb-1 text-center text-xl font-semibold text-ckt-text">密码登录</h3>
      <p className="mb-6 text-center text-xs text-gray-400">使用账号密码登录灵图工坊</p>

      <form onSubmit={onSubmit} autoComplete="off" className="space-y-4">
        <input
          type="text"
          name="prevent_autofill_username"
          autoComplete="username"
          className="hidden"
          tabIndex={-1}
          aria-hidden
        />
        <input
          type="password"
          name="prevent_autofill_password"
          autoComplete="current-password"
          className="hidden"
          tabIndex={-1}
          aria-hidden
        />
        <input
          name="login-account"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onFocus={(e) => e.target.removeAttribute('readonly')}
          readOnly
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
          placeholder="请输入用户名或手机号"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
          required
        />
        <div>
          <input
            type="password"
            name="login-secret"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={(e) => e.target.removeAttribute('readonly')}
            readOnly
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="请输入密码"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore
            required
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-ckt-primary hover:underline"
            >
              忘记密码？
            </button>
          </div>
        </div>

        {loginHint && !error && (
          <p className="text-center text-sm text-green-600">{loginHint}</p>
        )}

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ckt-primary py-3 text-sm font-medium text-white transition hover:bg-ckt-primary-hover disabled:opacity-60"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        演示账号：demo / 123456；手机号注册用户请用手机号登录
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        还没有账号？
        <button onClick={onSwitchRegister} className="ml-1 text-ckt-primary hover:underline">
          立即注册
        </button>
      </p>
    </div>
  )
}

function RegisterView({
  onBack,
  onRegistered,
}: {
  onBack: () => void
  onRegistered: (phone: string) => void
}) {
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [smsSentMsg, setSmsSentMsg] = useState('')
  const [debugCode, setDebugCode] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendSms = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号')
      return
    }
    setError('')
    setSmsSentMsg('')
    setDebugCode('')
    setSmsLoading(true)
    try {
      const res = await authApi.sendSms(phone)
      setSmsSentMsg(res.message)
      if (res.debugCode) setDebugCode(res.debugCode)
      setCountdown(60)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发送失败'
      if (msg.includes('Network Error') || msg.includes('500')) {
        setError('无法连接后端，请确认后端已启动（端口 8081）')
      } else {
        setError(msg)
      }
    } finally {
      setSmsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号')
      return
    }
    if (!/^\d{6}$/.test(smsCode)) {
      setError('请输入6位短信验证码')
      return
    }
    if (password.length < 6 || password.length > 18) {
      setError('密码长度需为6-18位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    setShowCaptcha(true)
  }

  const handleCaptchaSuccess = async () => {
    setShowCaptcha(false)
    setLoading(true)
    setError('')
    try {
      await authApi.registerByPhone({ phone, smsCode, password, confirmPassword })
      onRegistered(phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-10 pt-8">
        <button
          onClick={onBack}
          className="mb-6 flex w-fit items-center gap-1 text-sm text-ckt-text-secondary transition hover:text-ckt-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          返回登录
        </button>

        <h3 className="mb-8 text-center text-2xl font-semibold text-ckt-text">注册账号</h3>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mx-auto w-full max-w-[360px] space-y-4"
        >
          {/* 迷惑浏览器自动填充 */}
          <input type="text" name="prevent_autofill_username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden />
          <input type="password" name="prevent_autofill_password" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden />

          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="输入手机号"
            autoComplete="tel"
            maxLength={11}
            required
          />

          <div className="flex gap-3">
            <input
              name="sms-code"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
              placeholder="输入验证码"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
            <button
              type="button"
              onClick={handleSendSms}
              disabled={smsLoading || countdown > 0 || !/^1[3-9]\d{9}$/.test(phone)}
              className="shrink-0 rounded-lg border border-ckt-primary px-4 py-3.5 text-sm text-ckt-primary transition hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              {countdown > 0 ? `${countdown}s` : smsLoading ? '发送中' : '获取验证码'}
            </button>
          </div>

          <input
            type="password"
            name="reg-new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => e.target.removeAttribute('readonly')}
            readOnly
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="输入6-18位密码"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
            minLength={6}
            maxLength={18}
            required
          />

          <input
            type="password"
            name="reg-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={(e) => e.target.removeAttribute('readonly')}
            readOnly
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="确认密码"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore
            minLength={6}
            maxLength={18}
            required
          />

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {smsSentMsg && !error && (
            <p className="text-center text-sm text-green-600">{smsSentMsg}</p>
          )}

          {debugCode && (
            <p className="text-center text-xs text-gray-400">
              开发环境验证码：<span className="font-mono text-ckt-primary">{debugCode}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-ckt-primary py-3.5 text-sm font-medium text-white transition hover:bg-ckt-primary-hover disabled:opacity-60"
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/80 px-10 py-4 text-center text-[11px] text-gray-400">
        注册即同意{' '}
        <a href="#" className="text-ckt-primary hover:underline">用户协议</a>、
        <a href="#" className="text-ckt-primary hover:underline">隐私政策</a>
      </div>

      <PuzzleCaptchaModal
        open={showCaptcha}
        onClose={() => setShowCaptcha(false)}
        onSuccess={handleCaptchaSuccess}
      />
    </div>
  )
}

function ForgotPasswordView({
  onBack,
  onSuccess,
  resetPassword,
}: {
  onBack: () => void
  onSuccess: () => void
  resetPassword: (data: {
    phone: string
    smsCode: string
    password: string
    confirmPassword: string
  }) => Promise<void>
}) {
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [smsSentMsg, setSmsSentMsg] = useState('')
  const [debugCode, setDebugCode] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendSms = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号')
      return
    }
    setError('')
    setSmsSentMsg('')
    setDebugCode('')
    setSmsLoading(true)
    try {
      const res = await authApi.sendResetSms(phone)
      setSmsSentMsg(res.message)
      if (res.debugCode) setDebugCode(res.debugCode)
      setCountdown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSmsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    setLoading(true)
    try {
      await resetPassword({ phone, smsCode, password, confirmPassword })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-10 pt-8">
        <button
          onClick={onBack}
          className="mb-6 flex w-fit items-center gap-1 text-sm text-ckt-text-secondary transition hover:text-ckt-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          返回登录
        </button>

        <h3 className="mb-2 text-center text-2xl font-semibold text-ckt-text">忘记密码</h3>
        <p className="mb-8 text-center text-xs text-gray-400">
          通过注册手机号验证后重置密码
        </p>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mx-auto w-full max-w-[360px] space-y-4"
        >
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="输入注册手机号"
            autoComplete="tel"
            maxLength={11}
            required
          />

          <div className="flex gap-3">
            <input
              name="sms-code"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
              placeholder="输入验证码"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
            <button
              type="button"
              onClick={handleSendSms}
              disabled={smsLoading || countdown > 0 || !/^1[3-9]\d{9}$/.test(phone)}
              className="shrink-0 rounded-lg border border-ckt-primary px-4 py-3.5 text-sm text-ckt-primary transition hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              {countdown > 0 ? `${countdown}s` : smsLoading ? '发送中' : '获取验证码'}
            </button>
          </div>

          <input
            type="password"
            name="reset-new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="输入新密码（6-18位）"
            autoComplete="new-password"
            minLength={6}
            maxLength={18}
            required
          />

          <input
            type="password"
            name="reset-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-ckt-primary focus:ring-2 focus:ring-ckt-primary/15"
            placeholder="确认新密码"
            autoComplete="new-password"
            minLength={6}
            maxLength={18}
            required
          />

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {smsSentMsg && !error && (
            <p className="text-center text-sm text-green-600">{smsSentMsg}</p>
          )}

          {debugCode && (
            <p className="text-center text-xs text-gray-400">
              开发环境验证码：<span className="font-mono text-ckt-primary">{debugCode}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-ckt-primary py-3.5 text-sm font-medium text-white transition hover:bg-ckt-primary-hover disabled:opacity-60"
          >
            {loading ? '提交中...' : '确认重置'}
          </button>
        </form>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/80 px-10 py-4 text-center text-[11px] text-gray-400">
        仅支持已绑定手机号的账号找回密码
      </div>
    </div>
  )
}
