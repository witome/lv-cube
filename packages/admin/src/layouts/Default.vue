<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">绿立方</div>
      <el-menu :default-active="activeMenu" router class="menu">
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>首页</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="left">{{ pageTitle }}</div>
        <div class="right">
          <el-dropdown @command="handleCommand">
            <span class="user">管理员</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const activeMenu = computed(() => route.path);
const pageTitle = computed(() => (route.meta?.title as string) || '');

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    localStorage.removeItem('token');
    ElMessage.success('已退出登录');
    router.push('/login');
  }
}
</script>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
}

.aside {
  background: #001529;

  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: white;
    font-size: 20px;
    font-weight: bold;
    background: #002140;
  }

  .menu {
    border-right: none;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 0 24px;

  .left {
    font-size: 16px;
    font-weight: 500;
  }

  .user {
    cursor: pointer;
    color: #666;
  }
}

.main {
  background: #f0f2f5;
  padding: 24px;
}
</style>
