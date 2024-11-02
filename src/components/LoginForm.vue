<script setup>
import { ref } from 'vue'
import store from '@/store';
import { useRouter } from 'vue-router';
import { notify } from '@kyvg/vue3-notification';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const isLoading = ref(false);

const emit = defineEmits(['switchToForgotPassword']);

const switchToForgotPassword = () => {
  emit('switchToForgotPassword');
};
const handleLogin = async (event) => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await store.dispatch('login', { email: email.value, password: password.value });
    const userInfo = store.state.user
    console.log(userInfo)
    if (userInfo.role != 1) {
      notify({
        title: 'Lỗi',
        text: 'Bạn không có quyền truy cập!',
        type: 'error',
      });
      return
    }
    const intendedRoute = localStorage.getItem('intendedRoute');
    if (intendedRoute) {
      router.push(intendedRoute);
      localStorage.removeItem('intendedRoute');
    } else {
      router.push('/assistant');
    }
    notify({
      title: 'Thành công',
      text: 'Đăng nhập thành công!',
      type: 'success',
    });

  } catch (error) {
    notify({
      title: 'Lỗi',
      text: error.message || 'Đăng nhập thất bại, vui lòng thử lại.',
      type: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

</script>
<template>
  <form class="form" @submit.prevent="handleLogin">
    <input type="text" v-model="email" placeholder="Tài khoản" required />
    <input type="password" v-model="password" placeholder="Mật khẩu" required />
    <button type="submit" :disabled="isLoading">
      <span v-if="isLoading">
        <svg style="margin-bottom: -3px;"  xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
            opacity="0.5" />
          <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
            <animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12"
              type="rotate" />
          </path>
        </svg>
        Đăng đăng nhâp ...</span>
      <span v-else>Đăng nhập</span>
    </button>
    <span class="forgot-password" @click="switchToForgotPassword">Quên mật khẩu</span>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

input {
  padding: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 15px;
  font-size: 16px;
  background: var(--color-primary);
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) 35%, rgba(44, 44, 44, 1) 100%);
  color: white;
  border: none;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}

.error {
  color: red;
}

.forgot-password {
  color: #007bff;
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>