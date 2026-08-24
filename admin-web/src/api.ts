export interface AdminUser {
  id: number
  username: string
  nickname?: string
  phone?: string
  systemRole: 'user' | 'admin' | 'operator'
  memberLevel?: number
  status?: number
  createTime?: string
}

interface ApiResult<T> {
  code: number
  message: string
  data: T
}

const tokenKey = 'lingtu_admin_token'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem(tokenKey)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(url, { ...options, headers })
  const body = (await response.json()) as ApiResult<T>
  if (!response.ok || body.code !== 200) throw new Error(body.message || '请求失败')
  return body.data
}

export async function login(username: string, password: string) {
  const data = await request<{ token: string; user: { systemRole?: string } }>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (data.user.systemRole !== 'admin') throw new Error('当前账号没有管理端权限')
  localStorage.setItem(tokenKey, data.token)
  return data
}

export function logout() {
  localStorage.removeItem(tokenKey)
}

export function hasToken() {
  return Boolean(localStorage.getItem(tokenKey))
}

export function listUsers() {
  return request<AdminUser[]>('/admin/admin/users')
}

export function updateUser(id: number, data: { systemRole: AdminUser['systemRole']; status: number }) {
  return request<AdminUser>(`/admin/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
