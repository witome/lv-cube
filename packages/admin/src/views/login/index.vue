<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">绿立方运营后台</h1>
      <p class="subtitle">登录您的管理账号</p>
      <el-form ref="formRef" :model="form" :rules="rules" class="form">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
          />
        </el-form-item>
        <el-button type="primary" size="large" class="login-btn" @click="handleLogin">
          登 录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { login } from '@/api/auth';

const router = useRouter();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  phone: '',
  password: '',
});

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function handleLogin() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res: any = await login(form);
        localStorage.setItem('token', res.accessToken || res);
        ElMessage.success('登录成功');
        router.push('/dashboard');
      } catch (e: any) {
        ElMessage.error(e?.message || '登录失败，默认账号：admin / 123456');
      } finally {
        loading.value = false;
      }
    }
  });
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
}

.login-box {
  width: 400px;
  padding: 48px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  .title {
    margin: 0 0 8px;
    font-size: 28px;
    color: #2e7d32;
    text-align: center;
  }

  .subtitle {
    margin: 0 0 32px;
    color: #999;
    text-align: center;
  }

  .form {
    .login-btn {
      width: 100%;
      margin-top: 8px;
    }
  }
}
</style>
