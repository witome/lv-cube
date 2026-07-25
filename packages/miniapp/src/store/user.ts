import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserRole } from '@lv-cube/shared';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(uni.getStorageSync('token') || null);
  const userInfo = ref<any>(null);
  const currentRole = ref<UserRole>(UserRole.BUYER);

  const isLoggedIn = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    uni.setStorageSync('token', t);
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    uni.removeStorageSync('token');
  }

  function switchRole(role: UserRole) {
    currentRole.value = role;
  }

  return {
    token,
    userInfo,
    currentRole,
    isLoggedIn,
    setToken,
    logout,
    switchRole,
  };
});
