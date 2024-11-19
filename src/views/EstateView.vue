<script setup>
import { ref, computed, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import EstatePopup from '@/components/EstatePopup.vue';
import PaginationView from '@/components/Pagination.vue';

const viewType = ref('list');
const estales = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);
const showPopup = ref(false);
const editEstateId = ref(null);
const isEdit = ref(false)
const selectedEstale = ref(null)
const addNewEstate = () => {
  showPopup.value = true;
  isEdit.value = false
  editEstateId.value = null;
};

const editEstate = (estale = null, edit = false) => {
  selectedEstale.value = estale
  isEdit.value = edit
  showPopup.value = true;
};
const closePopup = () => {
  showPopup.value = false
  selectedEstale.value = null
}
const fetchEstates = async (page = currentPage.value, limit = itemsPerPage.value) => {
  try {
    const response = await request.get(END_POINT.ESTALES_LIST, {
      params: {
        page,
        limit
      }
    });
    estales.value = response.realEstates;
    total.value = response.total;
    currentPage.value = response.page;
    itemsPerPage.value = response.limit;
  } catch (error) {
    console.error('Lỗi lấy danh sách bài viết:', error);
  }
};
const confirmDelete = (userId) => {
  if (confirm("Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?")) {
    deleteEstate(userId)
  }
}

const deleteEstate = async (estaleId) => {
  try {
    const response = await request.delete(END_POINT.ESTALE_DELETE, {
      data: JSON.stringify({ id: estaleId })
    });
    estales.value = estales.value.filter(estale => estale.id !== estaleId)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa bài viết thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error)
    notify({
      title: 'Lỗi',
      text: 'Xóa bài viết thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}
// const totalPages = computed(() => {
//   return Math.ceil(total.value / itemsPerPage.value);
// });
const changePage = (page) => {
  currentPage.value = page;
  fetchEstates(currentPage.value, itemsPerPage.value);
};

onMounted(() => {
  fetchEstates();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button @click="setView('list')" :class="{ active: viewType === 'list' }">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Danh sách bài viết bất động sản</h1>
    </div>
    <div class="main-content">
      <div class="group-button">
        <button class="button" @click="addNewEstate"><i class='bx bx-message-square-add'></i> Thêm trợ lý</button>
      </div>
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>STT</th>
            <th>Hình ảnh</th>
            <th>Tên tiêu đề</th>
            <th>Mô tả</th>
            <th>Mô tả chi tiết</th>
            <th>Đường dẫn URL</th>
            <th>Trạng thái</th>
            <th style="width: 150px;"> Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in estales" :key="item.id">
            <td style="text-align: center;">{{ index + 1 }}</td>
            <td>
              <img :src="item.image" alt="Estate Image" style="width: 50px; height: 50px;" />
            </td>
            <td>{{ item.title }}</td>
            <td>
              <div class="description">
                {{ item.description }}
              </div>
            </td>
            <td >
              <div>
                <p>{{ item.area }}</p>
                <p>{{ item.price }}</p>
                <p>{{ item.location }}</p>
                <p>{{ item.exten }}</p>
              </div>
            </td>
            <td><a :href="item.base_url" target="_blank">{{ item.base_url }}</a></td>
            <td>{{ item.status }}</td>
            <td class="table-button">
              <button class="button" @click="editEstate(item, true)"><i class="bx bx-edit-alt"></i> Chỉnh sửa</button>
              <button class="button" @click="confirmDelete(item.id)"><i class="bx bx-trash"></i> Xóa vĩnh viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
      <PaginationView :total="total" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
      @changePage="changePage" />
    </div>
    <EstatePopup v-if="showPopup" :selectedEstale="selectedEstale" :isEdit="isEdit" @close="closePopup"
      @saved="fetchEstates" />
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

.change-type button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.change-type button.active {
  background-color: var(--color-primary);
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
.description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: justify;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th:nth-child(3),
td:nth-child(3) {
  width: 300px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 400px;
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
  border: 1px solid rgba(128, 128, 128, 0.288);
  margin: 0;
}

tr {}

tr:hover {
  background-color: var(--color-primary)5b;
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
tr:hover {
background-color: #aed4d15b;
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
