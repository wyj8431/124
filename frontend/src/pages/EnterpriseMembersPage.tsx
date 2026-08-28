import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailPlus, RefreshCw, ShieldCheck, Trash2, Users } from 'lucide-react'
import { teamApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { TeamMember, TeamOverview } from '@/types/team'

function memberLabel(member: TeamMember) {
  return member.nickname || member.username || `用户 ${member.userId}`
}

function roleLabel(role: string) {
  return role === 'owner' ? '所有者' : role === 'admin' ? '管理员' : '成员'
}

function presenceLabel(presence?: string | null) {
  return presence === 'online' ? '在线' : presence === 'away' ? '离开' : '离线'
}

export function EnterpriseMembersPage() {
  const { isLoggedIn, setShowLoginModal } = useAuth()
  const [team, setTeam] = useState<TeamOverview | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [inviteTarget, setInviteTarget] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [busyMemberId, setBusyMemberId] = useState<number | null>(null)

  const loadTeam = useCallback(async () => {
    setIsLoading(true)
    setError('')
    setNotice('')
    try {
      const current = await teamApi.getCurrent()
      const currentMembers = await teamApi.getMembers(current.teamId)
      setTeam(current)
      setMembers(currentMembers)
    } catch (err) {
      setError(err instanceof Error ? err.message : '团队信息加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      setIsLoading(false)
      return
    }
    void loadTeam()
  }, [isLoggedIn, loadTeam, setShowLoginModal])

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!team || !inviteTarget.trim()) return
    setIsInviting(true)
    setError('')
    setNotice('')
    try {
      const target = inviteTarget.trim()
      const numericId = /^\d+$/.test(target) ? Number(target) : undefined
      await teamApi.invite(team.teamId, numericId !== undefined ? { userId: numericId, role: inviteRole } : { email: target, role: inviteRole })
      setInviteTarget('')
      await loadTeam()
      setNotice('邀请已发送，等待对方接受。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '邀请发送失败')
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRoleChange(member: TeamMember, role: 'admin' | 'member') {
    if (!team || member.role === role) return
    setBusyMemberId(member.userId)
    setError('')
    setNotice('')
    try {
      const updated = await teamApi.updateRole(team.teamId, member.userId, role)
      setMembers((current) => current.map((item) => (item.userId === updated.userId ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '角色更新失败')
    } finally {
      setBusyMemberId(null)
    }
  }

  async function handleRemove(member: TeamMember) {
    if (!team || !window.confirm(`确定移除 ${memberLabel(member)} 吗？`)) return
    setBusyMemberId(member.userId)
    setError('')
    setNotice('')
    try {
      await teamApi.removeMember(team.teamId, member.userId)
      setMembers((current) => current.filter((item) => item.userId !== member.userId))
      setTeam((current) => current ? { ...current, memberCount: Math.max(0, current.memberCount - 1) } : current)
    } catch (err) {
      setError(err instanceof Error ? err.message : '移除成员失败')
    } finally {
      setBusyMemberId(null)
    }
  }

  if (!isLoggedIn) {
    return <div className="enterprise-page__loading">请先登录后管理团队</div>
  }

  return (
    <div className="enterprise-page team-members-page">
      <div className="team-members-shell">
        <header className="team-members-header">
          <div>
            <Link className="team-members-back" to="/designtools/enterprise/accountOverview">团队概览</Link>
            <h1>成员管理</h1>
            <p>{team ? `${team.name} · ${team.versionLabel}` : '管理团队成员与权限'}</p>
          </div>
          <button type="button" className="team-members-refresh" onClick={() => void loadTeam()} disabled={isLoading}>
            <RefreshCw size={16} aria-hidden="true" /> 刷新
          </button>
        </header>

        {error && <div className="team-members-alert" role="alert">{error}</div>}
        {notice && <div className="team-members-notice" role="status">{notice}</div>}
        {isLoading ? (
          <div className="enterprise-page__loading">加载团队成员...</div>
        ) : !team ? (
          <div className="enterprise-page__loading">暂无团队信息</div>
        ) : (
          <div className="team-members-grid">
            <section className="team-members-panel team-members-panel--invite">
              <div className="team-members-panel__heading">
                <MailPlus size={18} aria-hidden="true" />
                <div><h2>邀请成员</h2><p>通过邮箱或用户 ID 发送邀请</p></div>
              </div>
              {team.currentRole !== 'owner' && team.currentRole !== 'admin' ? <p className="team-members-permission">只有 owner 或管理员可以邀请成员。</p> : null}
              <form onSubmit={handleInvite} className="team-members-invite-form">
                <label>
                  邮箱 / 用户 ID
                  <input value={inviteTarget} onChange={(event) => setInviteTarget(event.target.value)} placeholder="name@example.com" required disabled={team.currentRole !== 'owner' && team.currentRole !== 'admin'} />
                </label>
                <label>
                  初始角色
                  <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as 'admin' | 'member')} disabled={team.currentRole !== 'owner' && team.currentRole !== 'admin'}>
                    <option value="member">成员</option>
                    <option value="admin">管理员</option>
                  </select>
                </label>
                <button type="submit" className="team-members-primary" disabled={isInviting || team.memberCount >= team.maxMembers || (team.currentRole !== 'owner' && team.currentRole !== 'admin')}>
                  {isInviting ? '发送中...' : team.memberCount >= team.maxMembers ? '成员已达上限' : '发送邀请'}
                </button>
              </form>
            </section>

            <section className="team-members-panel team-members-panel--list">
              <div className="team-members-list-heading">
                <div><h2>团队成员</h2><p>{team.memberCount} / {team.maxMembers} 个席位</p></div>
                <Users size={20} aria-hidden="true" />
              </div>
              {members.length === 0 ? <div className="team-members-empty">暂无成员</div> : (
                <div className="team-members-table-wrap">
                  <table className="team-members-table">
                    <thead><tr><th>成员</th><th>状态</th><th>角色</th><th>操作</th></tr></thead>
                    <tbody>
                      {members.map((member) => {
                        const isOwner = member.role === 'owner'
                        const canManage = team.currentRole === 'owner' && !isOwner
                        return (
                          <tr key={member.userId}>
                            <td><div className="team-member-cell"><span className="team-member-avatar">{memberLabel(member).slice(0, 1).toUpperCase()}</span><div><strong>{memberLabel(member)}</strong><small>{member.username || `ID ${member.userId}`}</small></div></div></td>
                            <td><span className={`team-member-presence team-member-presence--${member.presence === 'online' ? 'online' : 'offline'}`}>{presenceLabel(member.presence)}</span></td>
                            <td>{canManage ? <select aria-label={`${memberLabel(member)}角色`} value={member.role} disabled={busyMemberId === member.userId} onChange={(event) => void handleRoleChange(member, event.target.value as 'admin' | 'member')}><option value="admin">管理员</option><option value="member">成员</option></select> : <span className="team-member-role"><ShieldCheck size={14} aria-hidden="true" /> {roleLabel(member.role)}</span>}</td>
                            <td>{canManage ? <button type="button" className="team-members-remove" onClick={() => void handleRemove(member)} disabled={busyMemberId === member.userId}><Trash2 size={14} aria-hidden="true" /> 移除</button> : <span className="team-members-muted">{isOwner ? '团队所有者' : '仅所有者可管理'}</span>}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
