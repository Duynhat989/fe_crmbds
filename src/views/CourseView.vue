<script setup>
import { ref, computed, onMounted } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import CoursePopup from '@/components/CoursePopup.vue';
import { notify } from '@kyvg/vue3-notification';
const courses = ref([]);
const showPopup = ref(false)
const selectedCourse = ref(null)
const isEdit = ref(false)
import PaginationView from '@/components/Pagination.vue';

const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);

const addNewCourse = () => {
  showPopup.value = true;
  selectedCourse.value = null,
    isEdit.value = false
};


const openPopup = (course = null, edit = false) => {
  selectedCourse.value = course
  isEdit.value = edit
  showPopup.value = true
}


const closePopup = () => {
  showPopup.value = false
  selectedCourse.value = null
}
const totalPages = computed(() => {
  return Math.ceil(total.value / itemsPerPage.value);
});

const changePage = (page) => {
  currentPage.value = page;
  fetchCourses(currentPage.value, itemsPerPage.value);
};
const fetchCourses = async (page = currentPage.value, limit = itemsPerPage.value) => {
  try {
    const response = await request.get(END_POINT.COURSES_LIST, {
      params: {
        page,
        limit
      }
    });
    courses.value = response.courses;
    total.value = response.total;
    currentPage.value = response.page;
    itemsPerPage.value = response.limit;
  } catch (error) {
    console.error('Lỗi lấy danh sách trợ lý:', error);
  }
};

const confirmDelete = (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa khóa học này vĩnh viễn?")) {
    deleteCourse(id)
  }
}

const deleteCourse = async (id) => {
  try {
    const response = await request.delete(END_POINT.COURSE_DELETE, {
      data: JSON.stringify({ id: id })
    });
    courses.value = courses.value.filter(course => course.id !== id)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa khóa học thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa khóa học:', error)
    notify({
      title: 'Lỗi',
      text: 'Xóa khóa học thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}

onMounted(() => {
  fetchCourses();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button class="list">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Danh sách khóa học</h1>
    </div>
    <div class="main-content">
      <div class="group-button">
        <button class="button" @click="addNewCourse"><i class='bx bx-video-plus'></i> Thêm khóa học</button>
      </div>
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Hình ảnh</th>
            <th>Tên khóa học</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in courses" :key="index">
            <td style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;"><img :src="item.image" alt="Hình ảnh"></td>
            <td style="max-width: 150px;">{{ item.name }}</td>
            <td class="detail">{{ item.detail }}</td>
            <td> <span :class="{ active: item.status === 1, inactive: item.status !== 1 }">
                {{ item.status === 1 ? 'Hoạt động' : 'Ngừng hoạt động' }}
              </span></td>
            <td class="table-button">
              <button class="button" @click="openPopup(item, true)"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
              <button class="button" @click="confirmDelete(item.id)"><i class='bx bx-trash'></i> Xóa vĩnh viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
      <PaginationView :total="total" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
      @changePage="changePage" />
    </div>
    <CoursePopup v-if="showPopup" :selectedCourse="selectedCourse" :isEdit="isEdit" @close="closePopup"
      @saved="fetchCourses" />

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
  color: var(--color-primary);
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

.change-type button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--color-primary);
  color: white;
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
  background-color: var(--color-primary);
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

td {
  padding: 5px 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.288);
  border-left: 1px solid rgba(128, 128, 128, 0.288);
  margin: 0;
}

td img {
  width: 80px;
  height: 80x;
  object-fit: contain;
}

td .detail {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: justify;
}

td .active {
  color: #28a745;
}

td .inactive {
  color: #dc3545;
}


tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}

.group-button {
  margin-right: 5px;
  margin-bottom: 10px;
}

.group-button .button {
  padding: 8px 10px;
  margin-right: 5px;
  border: 1px solid rgba(128, 128, 128, 0);
  transition: all 0.5s;
  margin-right: 5px;
  min-width: 200px;
  padding: 10px;
  background-color: var(--color-primary);
  color: white;
}

.group-button .button:hover {
  border: 1px solid var(--color-primary);
  background-color: #ffffff;
  color: rgb(255, 0, 0);
  cursor: pointer;
}

.pagination {
  width: 100%;
  margin-top: 20px;
}

.pagination span {
  padding: 10px 15px;
  background-color: #ccc;
  color: #111;
  margin: 0px 5px;
  cursor: pointer;
}

.pagination span.active,
.pagination span:hover {
  background-color: var(--color-primary);

  color: #fff;
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
