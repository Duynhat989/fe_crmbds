<script setup>
import { ref, watch } from 'vue';
import ItemBox from '@/components/ItemBox.vue';
import RegisterForm from '@/components/RegisterForm.vue';
import LoginForm from '@/components/LoginForm.vue';
import footerView from '@/components/footerView.vue';
import ForgotPasswordForm from '@/components/ForgotPasswordForm.vue';
import store from '@/store';

import icon_logo1 from '../assets/icon_logo1.png'

const isHighlighted = ref(false);
const activeTab = ref('login');
const mainWeb = import.meta.env.VITE_API_APP
console.log(mainWeb)
// watch(activeTab, (newTab) => {
//   if (newTab === 'login') {
//     isHighlighted.value = true;
//   }
// });
const setActiveTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'login') {
    isHighlighted.value = true;
    setTimeout(() => {
      isHighlighted.value = false;
    }, 3000);
  }
};
const handleClick = (routeName) => {
  if (!store.getters.isLogin) {
    localStorage.setItem('intendedRoute', routeName);
    setActiveTab('login');
  } else {
    router.push({ name: routeName });
  }
};

const openLink = () => {
  window.open(mainWeb,'_blank')
};
</script>
<template>
  <div class="main-container">
    <div class="header-title">
      <h1 class="title">An Phát Hưng</h1>
      <span>Quản lý tài nguyên, cập nhật giải pháp mới cho thành viên</span>
    </div>
    <div class="content">

      <div class="right-box" :class="{ highlight: isHighlighted }" style="margin: auto;">
        <div class="right-icon">
          <img :src="icon_logo1" alt="icon logo">
        </div>
        <div class="tabs">
          <button class="tab-button" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">Đăng nhập
          </button>
          <button class="tab-button" :class="{ active: activeTab === 'register' }" @click="openLink">
            Bản Chính Thức
          </button>
        </div>

        <div class="form-container">
          <LoginForm v-if="activeTab === 'login'" @switchToForgotPassword="setActiveTab('forgotPassword')" />
          <RegisterForm v-if="activeTab === 'register'" @switchToForgotPassword="setActiveTab('forgotPassword')" />
          <ForgotPasswordForm v-if="activeTab === 'forgotPassword'" />
        </div>
      </div>
    </div>
  </div>
  <!-- <footerView /> -->
</template>

<style scoped>
.main-container {
  max-width: 1200px;
  margin: 10px auto;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  margin: 100px 0;
}

.header-title {
  text-align: center;
  margin: 30px auto;
}

.header-title .title {
  font-size: 50px;
  font-weight: bold;
  color: var(--color-primary);
  line-height: 56px;
}

.header-title p {
  font-size: 18px;
  color: #555;
  margin-top: 10px;
  line-height: 1.6;
}

.left-box {
  width: 55%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
}

.right-box {
  width: calc(100% - 55% - 20px);
  background-color: white;
  padding: 60px 30px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.right-icon {
  position: absolute;
  right: -10px;
  top: -85px;
}

.right-icon img {
  width: 120px;
  height: auto;
}

.tabs {
  display: flex;
  justify-content: left;
  margin-bottom: 20px;
  width: fit-content;
  border-radius: 5px;
  overflow: hidden;
}

.tab-button {
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #f4f4f4;
  color: #333;
  border: none;
  min-width: 150px;
}

.tab-button.active {
  background: var(--color-primary);
  background: linear-gradient(90deg, var(--color-primary)0%, var(--color-primary)35%, rgba(44, 44, 44, 1) 100%);
  color: white;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.highlight {
  border: 2px solid var(--color-primary);
  background-color: #fff3e0;
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.5);
  transition: all 0.3s ease;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .main-container {
    max-width: 1000px;
    padding: 0px 15px ;
  }


}

@media (max-width: 992px) {
  .main-container {
    max-width: 800px;
  }

}

@media (max-width: 768px) {
  .main-container {
    max-width: 600px;
  }

  .header-title .title {
    font-size: 30px;
    line-height: 40px;
  }

  .header-title p {
    font-size: 16px;
  }

  .content {
    flex-direction: column;
  }

  .left-box,
  .right-box {
    width: 100%;
  }

  .right-box {
    order: 1;
  }

  .left-box {
    order: 2;
    gap: 10px;
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .main-container {
    max-width: 100%;
  }
}
</style>
