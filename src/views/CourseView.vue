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
const courses = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(8);

const handleClick = (id) => {
  const encodedId = encodeId(id);
  router.push(`/assistant/${encodedId}`);
};

const fetchCourses = async () => {
  try {
    const response = await request.get(END_POINT.COURSES_LIST);
    courses.value = response.data;
  } catch (error) {
    console.error('Lỗi lấy danh sách trợ lý:', error);
  }
};

const setView = (type) => {
  viewType.value = type;
};

onMounted(() => {
  fetchCourses();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button @click="setView('list')" :class="{ active: viewType === 'list' }">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Danh sách khóa học</h1>
    </div>
    <div class="main-content">
      <div class="group-button">
        <button class="button"><i class='bx bx-video-plus' ></i> Thêm khóa học</button>
        <!-- <button class="button"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button> -->
      </div>
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Tên khóa học</th>
            <th >Số điện thoại</th>
            <th >Email</th>
            <th>Quyền</th>
            <th>Gói cước</th>
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in courses" :key="index">
            <td  style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;">{{ item.name }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.role == 1 ? 'Quản trị viên':'Người dùng' }}</td>
            <td>Miễn phí</td>
            <td class="table-button">
              <button class="button"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
              <button class="button"><i class='bx bx-trash'></i> Xóa vĩnh viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>

<style scoped>
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
.button:hover{
  background-color: #e03d31;
  color: white;
  cursor: pointer;
}
.input {
  padding: 8px 10px;
  border: 1px solid rgba(128, 128, 128, 0.226);
  cursor: pointer;
}
.input:focus{
  outline: none;
}
td {
  padding: 5px 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.288);
  border-left: 1px solid rgba(128, 128, 128, 0.288);
  margin: 0;
}
tr{
}
tr:hover {
  background-color: #e03d315b;
  cursor: pointer;
}
.group-button{
  margin-right: 5px;
  margin-bottom: 10px;
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
