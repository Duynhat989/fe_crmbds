import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AssistantView from '../views/AssistantView.vue'
import CustomerView from '../views/CustomerView.vue'
import store from '@/store';
import EstateView from '@/views/EstateView.vue';
import ContractView from '@/views/ContractView.vue';
import CourseView from '@/views/CourseView.vue';
import SetupView from '@/views/SetupView.vue';
import PackageView from '@/views/PackageView.vue';
import PaymentManagement from '@/views/PaymentManagement.vue';
import DashboardView from '@/views/DashboardView.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: (to, from, next) => {
        if (store.getters.isLogin) {
          next('/dashboard');
        } else {
          next(); 
        }
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/assistant',
      name: 'assistant',
      component: AssistantView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/contract',
      name: 'contract',
      component: ContractView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/license',
      name: 'license',
      component: PackageView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/estate',
      name: 'estate',
      component: EstateView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/course',
      name: 'course',
      component: CourseView ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentManagement ,
      meta: { requiresAuth: true } 
    },
    {
      path: '/setting',
      name: 'setting',
      component: SetupView ,
      meta: { requiresAuth: true } 
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isLogin = store.getters.isLogin;
  if (to.meta.requiresAuth && !isLogin) {
    localStorage.setItem('intendedRoute', to.fullPath);
    next('/'); 
  } else {
    next();
  }
});

export default router
