<script setup>
import { ref, computed, onMounted } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { useRouter } from 'vue-router';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import { encodeId } from '@/utils/encoding';
const router = useRouter();
const viewType = ref('list');
const setups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(8);


const apiObject = ref();

const fetchSetups = async () => {
  try {
    const response = await request.get(END_POINT.SETUP_LIST);
    setups.value = response.data;
    // console.error(setups.value);
    apiObject.value = setups.value.find(item => item.name === 'API_KEY');
  } catch (error) {
    console.error('Lỗi lấy danh sách trợ lý:', error);
  }
};

const setView = (type) => {
  viewType.value = type;
};

onMounted(() => {
  fetchSetups();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button @click="setView('list')" :class="{ active: viewType === 'list' }">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Gói cước AnPhatHung.AI</h1>
    </div>
    <div class="main-content">
      <!-- <div class="group-button">
        <button class="button"><i class='bx bxs-user-plus'></i> Thêm người dùng</button>
        <button class="button"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
      </div> -->
      <div class="setting">
        <div class="setting_content">
          <div class="row-set flex">
            <div class="input-text" v-if="apiObject">
              <label for="">Thông tin API</label>
              <input type="text" class="input" v-model="apiObject.value">
            </div>
            <div class="input-text" v-if="apiObject">
              <label for="">Thông tin API</label>
              <input type="text" class="input" v-model="apiObject.value">
            </div>
          </div>
        </div>
      </div>
      <div class="group-button">
        <button class="button"><i class='bx bx-cog' ></i> Lưu cài đặt</button>
        <!-- <button class="button"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button> -->
      </div>
    </div>
  </div>

</template>

<style scoped>
.flex{
  display: flex;
}
.header-title {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.header-title .title {
  font-size: 30px;
  font-weight: bold;
  color: #e03d31;
  line-height: 40px;
}

.main-container {
  /* max-width: 1100px; */
  margin: 40px auto;
  position: relative;
  padding: 0 5%;
  height: 100dvh;
  overflow-y: scroll;
  padding-bottom: 100px;
}

.change-type button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.change-type button.active {
  background-color: #e03d31;
  color: white;
}

.change-type {
  position: absolute;
  top: 0;
  right: 0;
}

.main-content {
  width: 100%;
}

.table {
  width: 100%;
}

.table-button .button {
  padding: 10px;
  margin-right: 5px;
  border: 1px solid rgba(128, 128, 128, 0);
  transition: all 0.5s;
  width: 100%;
  margin-bottom: 3px;
}

.button:hover {
  background-color: #e03d31;
  color: white;
  cursor: pointer;
}

.input {
  padding: 8px 10px;
  border: 1px solid rgba(128, 128, 128, 0.226);
  cursor: pointer;
}

.input:focus {
  outline: none;
}
.input-text{
  width: 50%;
  padding-right: 10px;
}
.input-text label {
  display: block;
}
.input-text input{
  width: 100%;
}
.group-button .button{
  padding: 8px 10px;
  margin-right: 5px;
  border: 1px solid rgba(128, 128, 128, 0);
  transition: all 0.5s;
  margin-right: 5px;
  min-width: 200px;
  padding: 10px;
  background-color: #e03d31;
  color: white;
}
.group-button .button:hover{
  border: 1px solid #e03d31;
  background-color: #ffffff;
  color: rgb(255, 0, 0);
  cursor: pointer;
}
.setting{
  margin-bottom: 10px;
}
/* Responsive Styles */
@media (max-width: 1200px) {
  .main-container {
    max-width: 1000px;
  }
}

@media (max-width: 1024px) {
  .main-container {
    max-width: 800px;
    padding: 10px;
  }

  .list-card {
    width: calc((100% - 30px)/3);
  }
}

@media (max-width: 768px) {
  .main-container {
    max-width: 600px;
  }

  .list-card {
    width: calc((100% - 30px)/2);
  }
}

@media (max-width: 576px) {
  .main-container {
    max-width: 100%;
  }

  .list-card {
    width: 100%;
  }
}
</style>
