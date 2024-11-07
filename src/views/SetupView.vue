<script setup>
import { ref, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
const apiData = ref([]);
const assistants = ref([]);
const modifiedFields = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(100);
import { notify } from '@kyvg/vue3-notification';

const fetchSetups = async () => {
  try {
    const response = await request.get(END_POINT.SETUP_LIST);
    apiData.value = response.data;
  } catch (error) {
    console.error('Lỗi lấy danh sách cài đặt:', error);
  }
};
const fetchAssistants = async (page = currentPage.value, limit = itemsPerPage.value) => {
  try {
    const response = await request.get(END_POINT.ASSISTANTS_LIST, {
      params: {
        page,
        limit
      }
    });
    assistants.value = response.data;
  } catch (error) {
    console.error('Lỗi lấy danh sách trợ lý:', error);
  }
};
const handleChange = (name, value) => {
  modifiedFields.value[name] = value;
};

const updateData = async () => {
  const dataToUpdate = { ...modifiedFields.value };

  if (Object.keys(dataToUpdate).length === 0) {
    return;
  }
  try {
    const response = await request.post(END_POINT.SETUPSAVE, dataToUpdate);
    if (response.success) {
      modifiedFields.value = {};
      notify({
          title: 'Thành công',
          text: 'Cập nhật thành công!',
          type: 'success'
      });
    }
  } catch (error) {
    notify({
      title: 'Lỗi',
      text: 'Cập nhật thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
};

onMounted(() => {
  fetchAssistants();
  fetchSetups();
});
</script>
<template>
  <div class="main-content">
    <div class="setting">
      <div class="setting_content">
        <div v-for="api in apiData" :key="api.id" class="row-set flex">
          <div class="input-text">
            <label :for="'api_' + api.id">{{ api.name }}</label>
            <input v-if="api.name === 'API_KEY'" type="text" :id="'api_' + api.id" class="input" v-model="api.value"
              @input="handleChange(api.name, api.value)" />

            <select v-else-if="api.name === 'API_STATUS'" :id="'api_' + api.id" class="input" v-model="api.value"
              @change="handleChange(api.name, api.value)">
              <option value="1">On</option>
              <option value="0">Off</option>
            </select>

            <select v-else-if="['API_TEAMTRAINING', 'API_SUMMARY', 'API_FINANCEAL', 'API_ESTATE', 'API_CONTRACT','API_REP_CONTRACT'].includes(api.name)"
              :id="'api_' + api.id" class="input" v-model="api.value" @change="handleChange(api.name, api.value)">
              <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.id">
                {{ assistant.name }}
              </option>
            </select>
            <input v-else type="text" :id="'api_' + api.id" class="input" v-model="api.value" @input="handleChange(api.name, api.value)" />
          </div>
        </div>
        <button @click="updateData" class="update-button">Cập nhật</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 20px;
  background-color: #f9f9f9;
}

.setting_content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.row-set {
  margin-bottom: 15px;
}

.input-text {
  display: flex;
  flex-direction: column;
}

.input-text label {
  margin-bottom: 5px;
  font-weight: bold;
}

.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.update-button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.update-button:hover {
  background-color: #45a049;
}
</style>
