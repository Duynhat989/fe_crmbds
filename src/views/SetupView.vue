<script setup>
import { ref, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
const apiData = ref([]);
const fetchSetups = async () => {
  try {
    const response = await request.get(END_POINT.SETUP_LIST);
    apiData.value = response.data;
  } catch (error) {
    console.error('Lỗi lấy danh sách cài đặt:', error);
  }
};
onMounted(() => {
  fetchSetups();
});
</script>
<template>
  <div class="main-container">
    <div class="header-title">
      <h1 class="title">Cài đặt hệ thống</h1>
    </div>
    <div class="main-content">
      <div class="setting">
        <div class="setting_content">
          <div v-for="api in apiData" :key="api.id" class="row-set flex">
            <div class="input-text">
              <label :for="'api_' + api.id">{{ api.name }}</label>
              <input disabled type="text" :id="'api_' + api.id" class="input" v-model="api.value">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  padding: 0 5%;
  margin: 40px auto;
}

.change-type button {
  padding: 10px 20px;
  background-color: var(--color-primary);
  ;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.change-type button.active {
  background-color: var(--color-primary);
  ;
}

.header-title .title {
  font-size: 24px;
  color: var(--color-primary);
  ;
  margin: 20px 0;
}

.main-content {
  border: 1px solid #ddd;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.setting {
  margin-bottom: 20px;
}

.row-set {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.input-text {
  width: 100%;
}

.input-text label {
  display: block;
  font-weight: bold;
  color: #343434;
  ;
  margin-bottom: 5px;
}

.input-text .input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-primary);
  ;
  border-radius: 4px;
  font-size: 14px;
}
</style>
