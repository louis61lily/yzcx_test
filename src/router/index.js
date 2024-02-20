import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  { path: '', redirect: '/login'},
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/home', component:() => import('@/views/HomePage.vue')}
  ]
})

//检查用户是否已经登录。如果用户未登录且尝试访问需要登录权限的页面，则会被重定向到登录页面。
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  console.log(userStore.user.uniqueId);
  if (!userStore.user.uniqueId && to.path !== '/login') {
    // return '/login'  // 可以直接返回 '/login'，终止当前导航
    next('/login'); // 或者直接调用 next('/login') 进行路由跳转
  } else {
    next(); // 继续导航到下一个路由
  }
});
export default router
