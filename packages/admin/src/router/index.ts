import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: {
          template: '<div style="padding:24px;"><h2>欢迎使用绿立方运营后台</h2><p>Phase 0 初始化完成，后续功能开发中...</p></div>',
        },
        meta: { title: '首页' },
      },
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: { title: '用户列表' },
      },
      {
        path: 'user/supplier-review',
        name: 'SupplierReview',
        component: () => import('@/views/user/supplier-review.vue'),
        meta: { title: '供应商审核' },
      },
      {
        path: 'user/driver-review',
        name: 'DriverReview',
        component: () => import('@/views/user/driver-review.vue'),
        meta: { title: '司机审核' },
      },
      {
        path: 'category/list',
        name: 'CategoryList',
        component: () => import('@/views/category/index.vue'),
        meta: { title: '品类管理' },
      },
      {
        path: 'category/attr-template',
        name: 'AttrTemplate',
        component: () => import('@/views/category/attr-template.vue'),
        meta: { title: '属性模板' },
      },
      {
        path: 'product/list',
        name: 'ProductList',
        component: () => import('@/views/product/list.vue'),
        meta: { title: '商品列表' },
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表' },
      },
      {
        path: 'finance/settlement',
        name: 'SettlementList',
        component: () => import('@/views/finance/settlement.vue'),
        meta: { title: '结算记录' },
      },
      {
        path: 'finance/withdrawal',
        name: 'WithdrawalReview',
        component: () => import('@/views/finance/withdrawal.vue'),
        meta: { title: '提现审核' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
