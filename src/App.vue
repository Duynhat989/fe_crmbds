<script setup>
import { ref, computed, onMounted, watch } from "vue";
import store from '@/store';

import { useRouter, RouterView, useRoute } from 'vue-router'
import { Notifications } from "@kyvg/vue3-notification";
import icon_logo from './assets/icon_logo.png'
import logo from './assets/logo.png'


const isLogin = computed(() => store.getters.isLogin);
const user = computed(() => store.getters.getUser);
const currentRoute = computed(() => route.path);

const hiddenPopup = ref(false);
const isBodyFull = ref(false);

const router = useRouter();
const route = useRoute();
// check screen < 1024
const checkScreenSize = () => {
  hiddenPopup.value = window.innerWidth < 1024;
};
watch(hiddenPopup, (newType) => {
  if (newType === true && window.innerWidth < 576) {
    isBodyFull.value = false;
  } else {
    isBodyFull.value = true;
  }
});
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});
const handleLogOut = async (event) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await store.dispatch('logout');
    router.push('/');
  } catch (error) {
    // errorMessage.value = 'Đăng xuất lỗi.';
  }
};
</script>

<template>
  <div :class="hiddenPopup ? 'body flex hidden' : 'body flex'">
    <div class="body-bar" :class="{ 'body-bar__full': isBodyFull }" v-if="isLogin">
      <div class="nav">
        <div class="logo">
          <div class="logo_web flex" style="justify-items: center;">
            <div class="img flex" style="align-items: center;">
              <img :src="icon_logo" alt="" width="50">
            </div> &nbsp; &nbsp;
            <img :src="logo" alt="logo web" class="logo_text">
          </div>
        </div>
        <ul class="menu">
          <li :class="{ active: currentRoute === '/dashboard' }" class="menu_item">
            <a href="/dashboard" class="button">
              <i class='bx bxs-bar-chart-alt-2'></i>
              <span>Thống kê báo cáo</span>
            </a>
          </li>
          <li :class="{ active: currentRoute === '/customer' }" class="menu_item">
            <a href="/customer" class="button"><i class='bx bxs-user-account'></i> <span>Quản lý khách hàng</span></a>
          </li>
          <li :class="{ active: currentRoute === '/assistant' }" class="menu_item">
            <a href="/assistant" class="button"><i class='bx bx-equalizer'></i> <span>Quản lý trợ lý</span></a>
          </li>
          <li :class="{ active: currentRoute === '/contract' }" class="menu_item">
            <a href="/contract" class="button"><i class='bx bx-book-content'></i> <span>Quản lý hợp đồng</span></a>
          </li>
          <li :class="{ active: currentRoute === '/estate' }" class="menu_item">
            <a href="/estate" class="button"><i class='bx bx-search'></i> <span>Quản lý bài viết</span></a>
          </li>
          <li :class="{ active: currentRoute === '/course' }" class="menu_item">
            <a href="/course" class="button"><i class='bx bx-movie-play'></i> <span>Quản lý khóa học</span></a>
          </li>
          <li :class="{ active: currentRoute === '/license' }" class="menu_item">
            <a href="/license" class="button"><i class='bx bx-check-shield'></i> <span>Điều chỉnh gói cước</span></a>
          </li>
          <li :class="{ active: currentRoute === '/payment' }" class="menu_item">
            <a href="/payment" class="button"><i class='bx bxl-paypal' ></i><span>Quản lý thanh toán</span></a>
          </li>
          <li :class="{ active: currentRoute === '/setting' }" class="menu_item">
            <a href="/setting" class="button"><i class='bx bx-cog'></i> <span>Cài đặt chung</span></a>
          </li>
        </ul>
        <div class="user">
          <div class="user_profile flex">
            <div class="avata flex" style="align-items: center;">
              <img src="https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png" alt="" width="30" height="30">
            </div>
            <div class="username" style="padding-left: 10px;">
              <h3>{{ user.name }}</h3>
            </div>
            <div class="logout">
              <span @click="handleLogOut">Đăng xuất</span>
            </div>
          </div>
        </div>
      </div>
      <div class="menu_icon" v-if="hiddenPopup" @click="hiddenPopup = !hiddenPopup">
        <i style="font-size: 2em; color: var(--color-primary);" class='bx bx-menu-alt-left'></i>
      </div>
      <div class="menu_icon center" v-else @click="hiddenPopup = !hiddenPopup">
        <i style="font-size: 2em; color: var(--color-primary);" class='bx bx-caret-left-circle'></i>
      </div>
    </div>
    <div class="body-content" :class="!isLogin ? 'body-full' : ''">
      <RouterView />
    </div>
    <notifications />
  </div>
</template>

<style scoped>
h2{
  color: var(--color-primary);
  font-weight: 800;margin-left: 15px;
}
.body {
  height: 100dvh;
  overflow-y: hidden;
}

.flex {
  display: flex;
}

.nav {
  height: 100vh;
  width: 250px;
  box-shadow: 1px 2px 5px 1px rgba(128, 128, 128, 0.281);
  padding: 10px;
  background-color: #ececec;
  transition: all 0.3s;
  position: relative;
}

.body-bar {
  position: relative;
  z-index: 999;
  transition: all 0.5s;
}

.menu_icon {
  position: absolute;
  top: 10px;
  right: calc(-2em - 10px);
  z-index: 9;
  cursor: pointer;
  z-index: 9999;
}

.center {
  top: 42%;
}

.hidden .nav {
  width: 0 !important;
  visibility: hidden;
  opacity: 0;
  padding: 0;
  height: 0;
}

.hidden .body-content {
  width: 100% !important;
}

.body-content {
  width: calc(100% - 250px);
}

.body-full {
  width: 100%;
}

.logo {
  height: 100px;
}

.logo_web {
  align-items: center;
}
.logo_web .logo_text {
  width: 175px;
}
.menu {
  height: calc(100% - 180px);
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
  margin-top: 10px;
}

.menu_item {
  padding-left: 10px;
  display: flex;
  border: 1px solid rgba(170, 170, 170, 0);
  transition: all 0.5s;
  border-radius: 10px;
  color: var(--color-primary);
  /* box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px; */
}
.menu_item a{
}
.menu .active,
.menu_item:hover {
  background-color: var(--color-primary);
  cursor: pointer;

}
.menu .active .button,
.menu_item:hover .button {
  color: white;
}

.menu_item i {
  font-size: 1em;
}

li .button {
  display: flex;
  align-items: center;
  padding: 15px 5px;
  width: 100%;
}



li .button span {
  padding-left: 5px;
}

.user {
  height: 50px;
  background-color: #fff;
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  cursor: pointer;
  color: var(--color-primary);
  transition: all 1s;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}

.user:hover {
  border-color: #fff;
  color: #111;
}
.user_profile {
  border: 1px solid rgba(170, 170, 170, 0.226);
  padding: 10px;
  align-items: center;
  position: relative;
}

.user:hover .logout {
  left: 0px;
  bottom: 100%;
  transition: all 0.5s;

}

.logout {
  position: absolute;
  bottom: 110%;
  cursor: pointer;
  padding: 10px;
  background-color: #ececec;
  width: 100%;
  border-radius: 5px;
  left: -100%;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}

.logout:hover {
  background-color: var(--color-primary);
  color: #ececec;
}


@media (max-width: 768px) {
  .menu_icon.center {
    right: calc(-2em - -35px);
  }


}

@media (max-width: 576px) {
  .main-container {
    max-width: 100%;
  }

  .body-bar__full,
  .body-bar__full .nav {
    width: 100%;
  }

  .body-bar__full+.body-content {
    display: none;
  }
  .center {
    top: 10px;
  }
}
</style>
