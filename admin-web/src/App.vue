<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { hasToken, listUsers, login, logout, updateUser, type AdminUser } from './api'

const loggedIn = ref(hasToken())
const loading = ref(false)
const username = ref('admin')
const password = ref('123456')
const users = ref<AdminUser[]>([])

async function loadUsers() {
  loading.value = true
  try {
    users.value = await listUsers()
  } catch (error) {
    loggedIn.value = false
    logout()
    ElMessage.error(error instanceof Error ? error.message : '加载用户失败')
  } finally {
    loading.value = false
  }
}

async function submitLogin() {
  loading.value = true
  try {
    await login(username.value, password.value)
    loggedIn.value = true
    await loadUsers()
    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}

async function saveUser(user: AdminUser) {
  try {
    const updated = await updateUser(user.id, { systemRole: user.systemRole, status: user.status ? 1 : 0 })
    Object.assign(user, updated)
    ElMessage.success('用户权限已更新')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新失败')
    await loadUsers()
  }
}

async function toggleStatus(user: AdminUser) {
  const next = user.status ? 0 : 1
  try {
    await ElMessageBox.confirm(next ? '确认启用该账号？' : '确认禁用该账号？', '账号状态', { type: 'warning' })
    user.status = next
    await saveUser(user)
  } catch {
    // 用户取消确认时保持原状态
  }
}

function signOut() {
  logout()
  loggedIn.value = false
  users.value = []
}

onMounted(() => { if (loggedIn.value) void loadUsers() })
</script>

<template>
  <main v-if="!loggedIn" class="login-page">
    <el-card class="login-card">
      <div class="login-brand">灵图工坊</div>
      <p class="login-subtitle">管理端 · 用户与权限</p>
      <el-form @submit.prevent="submitLogin">
        <el-form-item label="账号"><el-input v-model="username" autocomplete="username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="password" type="password" show-password autocomplete="current-password" @keyup.enter="submitLogin" /></el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" class="login-button">登录管理端</el-button>
      </el-form>
    </el-card>
  </main>

  <main v-else class="admin-page">
    <header class="admin-header">
      <div><strong>灵图工坊管理端</strong><span>RBAC 用户管理</span></div>
      <el-button text @click="signOut">退出登录</el-button>
    </header>
    <section class="admin-content">
      <div class="page-heading"><div><h1>用户与权限</h1><p>管理账号角色、会员等级和启用状态。</p></div><el-button @click="loadUsers" :loading="loading">刷新</el-button></div>
      <el-card shadow="never">
        <el-table :data="users" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="账号" min-width="150" />
          <el-table-column prop="nickname" label="昵称" min-width="140" />
          <el-table-column prop="phone" label="手机号" min-width="140" />
          <el-table-column label="系统角色" width="180">
            <template #default="scope"><el-select v-model="scope.row.systemRole" @change="saveUser(scope.row)"><el-option label="普通用户" value="user" /><el-option label="运营人员" value="operator" /><el-option label="管理员" value="admin" /></el-select></template>
          </el-table-column>
          <el-table-column label="会员等级" width="120"><template #default="scope">{{ scope.row.memberLevel === 2 ? '团队版' : scope.row.memberLevel === 1 ? 'VIP' : '免费' }}</template></el-table-column>
          <el-table-column label="状态" width="120"><template #default="scope"><el-switch :model-value="scope.row.status === 1" @change="toggleStatus(scope.row)" /></template></el-table-column>
          <el-table-column prop="createTime" label="注册时间" min-width="180" />
        </el-table>
      </el-card>
    </section>
  </main>
</template>
