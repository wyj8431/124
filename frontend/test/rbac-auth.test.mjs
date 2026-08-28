import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const authSource = await readFile(new URL('../src/context/AuthContext.tsx', import.meta.url), 'utf8')
const apiSource = await readFile(new URL('../src/api/index.ts', import.meta.url), 'utf8')
const permissionSource = await readFile(new URL('../src/components/auth/PermissionGate.tsx', import.meta.url), 'utf8')
const rbacSource = await readFile(new URL('../src/pages/RbacPage.tsx', import.meta.url), 'utf8')
const backendAuthSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/dto/AuthDto.java', import.meta.url), 'utf8')
const securitySource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/config/SecurityConfig.java', import.meta.url), 'utf8')
const adminRbacSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/controller/AdminRbacController.java', import.meta.url), 'utf8')

test('auth persists refresh tokens and exposes WeChat login', () => {
  assert.match(authSource, /ckt_refresh_token/)
  assert.match(authSource, /loginByWechat/)
  assert.match(apiSource, /auth\/refresh/)
  assert.match(apiSource, /auth\/wechat\/login/)
})

test('sensitive routes use permission gates', () => {
  assert.match(appSource, /PermissionGate permission="ai:matting"/)
  assert.match(appSource, /PermissionGate permission="design:edit"/)
  assert.match(appSource, /PermissionGate permission="rbac:manage"/)
  assert.match(permissionSource, /canAccess/)
})

test('RBAC page exposes role matrix and user assignment', () => {
  assert.match(rbacSource, /RBAC 权限中心/)
  assert.match(rbacSource, /权限矩阵/)
  assert.match(rbacSource, /updateUserRole/)
  assert.match(apiSource, /export const adminRbacApi/)
})

test('ordinary users can create designs but cannot use AI matting', () => {
  assert.match(backendAuthSource, /case "user" -> java\.util\.List\.of\("design:read", "design:create", "design:edit", "workspace:read", "support:create"\)/)
  assert.doesNotMatch(backendAuthSource, /case "user" ->[^\n]*"ai:matting"/)
  assert.match(securitySource, /requestMatchers\("\/admin\/matting\/\*\*"\)\.hasRole\("ADMIN"\)/)
  assert.doesNotMatch(adminRbacSource, /"user", List\.of\([^\n]*"ai:matting"/)
})
