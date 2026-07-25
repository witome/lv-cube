import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('admin-user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<any>(null);

  const isLoggedIn = computed(() => !!token.value);

  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem('token');
  }

  return { token, userInfo, isLoggedIn, setToken, logout };
});
