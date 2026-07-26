import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, register as apiRegister, getProfile } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(uni.getStorageSync('token') || null);
  const userInfo = ref<any>(null);
  const currentRole = ref<string>('buyer');

  const isLoggedIn = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    uni.setStorageSync('token', t);
  }

  async function login(phone: string, password: string) {
    const res = await apiLogin({ phone, password });
    setToken(res.accessToken);
    await fetchProfile();
    return res;
  }

  async function register(phone: string, password: string, nickname?: string) {
    const res = await apiRegister({ phone, password, nickname });
    setToken(res.accessToken);
    await fetchProfile();
    return res;
  }

  async function fetchProfile() {
    try {
      const user = await getProfile();
      userInfo.value = user;
      const roles = Array.isArray(user.roles)
        ? user.roles
        : JSON.parse(user.roles || '["buyer"]');
      userInfo.value = { ...user, roles };
      if (!roles.includes(currentRole.value)) {
        currentRole.value = roles[0] || 'buyer';
      }
      return user;
    } catch (e) {
      return null;
    }
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    uni.removeStorageSync('token');
    currentRole.value = 'buyer';
  }

  function switchRole(role: string) {
    currentRole.value = role;
  }

  return {
    token,
    userInfo,
    currentRole,
    isLoggedIn,
    setToken,
    login,
    register,
    fetchProfile,
    logout,
    switchRole,
  };
});
