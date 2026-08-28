import { useEffect, useState } from 'react'
import { ShieldCheck, UserCog } from 'lucide-react'
import { adminRbacApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { UserInfo } from '@/types'

type Role = { code: string; label: string; description: string }
type Permission = { code: string; label: string }
export type RbacCatalog = { roles: Role[]; permissions: Permission[]; rolePermissions: Record<string, string[]>; users: Array<UserInfo & { status?: number }> }

export function RbacPage() {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState<RbacCatalog | null>(null)
  const [selectedRole, setSelectedRole] = useState('admin')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void adminRbacApi.get().then(setCatalog).catch((error) => setMessage(error instanceof Error ? error.message : '权限数据加载失败'))
  }, [])

  async function updateUserRole(target: UserInfo, systemRole: string) {
    try {
      const updated = await adminRbacApi.updateUser(target.id, { systemRole, status: 1 })
      setCatalog((current) => current ? { ...current, users: current.users.map((item) => item.id === updated.id ? { ...item, ...updated } : item) } : current)
      setMessage(`已将 ${target.nickname || target.username} 调整为${systemRole === 'admin' ? '管理员' : systemRole === 'operator' ? '运营人员' : '普通用户'}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '角色更新失败')
    }
  }

  if (user?.systemRole !== 'admin') return <div className="p-10 text-sm text-[#8f959e]">仅管理员可访问角色与权限管理。</div>
  if (!catalog) return <div className="p-10 text-sm text-[#8f959e]">正在加载权限配置...</div>

  const activePermissions = new Set(catalog.rolePermissions[selectedRole] || [])
  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div><div className="mb-2 flex items-center gap-2 text-sm text-[#1677ff]"><ShieldCheck size={18} /> RBAC 权限中心</div><h1 className="m-0 text-2xl font-semibold text-[#1f2329]">角色、页面与按钮权限</h1><p className="mt-2 text-sm text-[#8f959e]">按照最小权限原则分配角色，后端接口会同步执行权限校验。</p></div>
        <UserCog className="text-[#1677ff]" size={28} />
      </header>
      {message && <div className="mb-4 rounded-lg bg-[#f0f5ff] px-4 py-3 text-sm text-[#1677ff]" role="status">{message}</div>}
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <section className="rounded-xl border border-[#e5e6eb] bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#1f2329]">角色</h2>
          <div className="space-y-2">{catalog.roles.map((role) => <button key={role.code} type="button" onClick={() => setSelectedRole(role.code)} className={`w-full rounded-lg border px-3 py-3 text-left ${selectedRole === role.code ? 'border-[#1677ff] bg-[#f0f5ff]' : 'border-[#f0f1f3]'}`}><strong className="block text-sm text-[#1f2329]">{role.label}</strong><span className="mt-1 block text-xs text-[#8f959e]">{role.description}</span></button>)}</div>
        </section>
        <section className="rounded-xl border border-[#e5e6eb] bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-[#1f2329]">{catalog.roles.find((role) => role.code === selectedRole)?.label}权限矩阵</h2>
          <div className="grid gap-3 sm:grid-cols-2">{catalog.permissions.map((permission) => <label key={permission.code} className="flex items-center gap-3 rounded-lg bg-[#f7f8fa] px-3 py-3 text-sm text-[#505a71]"><input type="checkbox" checked={activePermissions.has(permission.code)} readOnly />{permission.label}<code className="ml-auto text-[10px] text-[#b0b6bf]">{permission.code}</code></label>)}</div>
          <h2 className="mb-3 mt-7 text-sm font-semibold text-[#1f2329]">用户角色分配</h2>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#f0f1f3] text-xs text-[#8f959e]"><th className="px-2 py-3">用户</th><th className="px-2 py-3">当前角色</th><th className="px-2 py-3">调整角色</th></tr></thead><tbody>{catalog.users.map((item) => <tr key={item.id} className="border-b border-[#f7f8fa]"><td className="px-2 py-3"><strong>{item.nickname || item.username}</strong><span className="ml-2 text-xs text-[#b0b6bf]">{item.username}</span></td><td className="px-2 py-3 text-[#505a71]">{item.systemRole || 'user'}</td><td className="px-2 py-3"><select value={item.systemRole || 'user'} onChange={(event) => void updateUserRole(item, event.target.value)} className="rounded border border-[#d9d9d9] px-2 py-1 text-xs"><option value="user">普通用户</option><option value="operator">运营人员</option><option value="admin">管理员</option></select></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  )
}
