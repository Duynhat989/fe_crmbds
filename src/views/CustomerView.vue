<script setup>
import { ref, computed, onMounted ,watch} from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import UserPopup from '@/components/UserPopup.vue';
import PaginationView from '@/components/Pagination.vue';

const searchQuery = ref('');

const users = ref([]);
const showPopup = ref(false)
const selectedUser = ref(null)
const isEdit = ref(false)

const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);


const selectedRole = ref('');
const selectedPackage = ref('');
const expirationStatus = ref('');
const packages = ref([]);

const fetchPackages = async () => {
    try {
        const response = await request.get(END_POINT.PACKAGES_LIST)
        if (response.success) {
            packages.value = response.packages
        }
    } catch (error) {
        console.error('Không thể tải danh sách gói cước:', error)
    }
}

const openPopup = (user = null, edit = false) => {
  selectedUser.value = user
  isEdit.value = edit
  showPopup.value = true
}


const closePopup = () => {
  showPopup.value = false
  selectedUser.value = null
}


const confirmDelete = (userId) => {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này vĩnh viễn?")) {
    deleteUser(userId)
  }
}

const deleteUser = async (userId) => {
  try {
    const response = await request.delete(END_POINT.USER_DELETE, {
      data: JSON.stringify({ id: userId })
    });
    users.value = users.value.filter(user => user.id !== userId)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa người dùng thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    notify({
      title: 'Lỗi',
      text: 'Xóa người dùng thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}

const fetchLicenses = async (userId) => {
  try {
    const response = await request.post(END_POINT.LICENSE_FIND, {
      user_id: userId
    });
    return response.success ? response.license : null;
  } catch (error) {
    console.error(`Không thể tải gói cước cho user_id ${userId}:`, error);
    return null;
  }
};
const fetchUsers = async (page = 1, limit = 10, search = searchQuery.value) => {
  try {
    const response = await request.get(END_POINT.USER_LIST, {
      params: {
        search,
        page,
        limit
      }
    });
    users.value = response.data;
    total.value = response.total;
    currentPage.value = response.page;
    itemsPerPage.value = response.limit;
    for (const user of users.value) {
      user.license = await fetchLicenses(user.id);
    }

  } catch (error) {
    console.error('Lỗi lấy danh sách người dung:', error)
  }
};

const totalPages = computed(() => {
  return Math.ceil(total.value / itemsPerPage.value);
});

const changePage = (page) => {
  currentPage.value = page;
  fetchUsers(currentPage.value, itemsPerPage.value);
};
let timeout;
watch(
  searchQuery,
  (newQuery) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fetchUsers(currentPage.value, itemsPerPage.value, newQuery);
    }, 2000);
  }
);

onMounted(() => {
  fetchPackages();
  fetchUsers();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button class="list">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Danh sách người dùng</h1>
    </div>
    <div class="search-bar">
        <div class="search-row">
            <i class='bx bx-search-alt-2 search-icon'></i>
            <input type="text" v-model="searchQuery" placeholder="Nhập tìm kiếm người dùng..." class="search-input" />
        </div>
        <div class="filter-row">
        <select v-model="selectedRole" class="filter-select">
          <option value="">Tất cả quyền</option>
          <option value="1">Quản trị viên</option>
          <option value="0">Người dùng</option>
        </select>
        <select v-model="selectedPackage" class="filter-select">
          <option value="">Tất cả gói cước</option>
          <option v-for="pack in packages" :key="pack.id" :value="pack.name">{{ pack.name }}</option>
        </select>
        <select v-model="expirationStatus" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="expired">Hết hạn</option>
          <option value="active">Còn hiệu lực</option>
        </select>
      </div>
    </div>
    <div class="main-content">
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Tên người dùng</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Gói cước</th>
            <th>Ngày hết hạn</th>
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in users" :key="index">
            <td style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;">{{ item.name }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.role == 1 ? 'Quản trị viên' : 'Người dùng' }}</td>
            <td>{{ item.license?.pack.name }}</td>
            <td>{{ item.license?.date }}</td>
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
    <UserPopup v-if="showPopup" :packs="packages" :user="selectedUser" :isEdit="isEdit" @close="closePopup" @saved="fetchUsers" />
  </div>

</template>

<style scoped>
.header-title {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
}

.header-title .title {
  font-size: 30px;
  font-weight: bold;
  color: var(--color-primary);
  line-height: 40px;
}

.search-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 60%;
    margin: 0 auto;
    margin-bottom: 20px;
}
.search-row {
    position: relative;
    width: 100%;
}
.search-icon {
    position: absolute;
    top: 50%;
    left: 15px;
    transform: translateY(-50%);
    font-size: 16px;
    color: #aaa;
    pointer-events: none;
}
.search-input {
    width: 100%;
    padding: 10px 20px 10px 40px;
    border: 2px solid #fff;
    border-radius: 25px;
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.search-input:focus {
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
    color: #aaa;
    font-size: 14px;
}
.filter-select {
  width: 200px;
  padding: 8px 10px; 
  margin-right: 10px; 
  border: 1px solid #ccc;
  border-radius: 5px; 
  font-size: 14px;
  color: #333; 
  background-color: #fff;
  appearance: none; 
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.filter-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); 
  outline: none; 
}

.filter-select::placeholder {
  color: #aaa;
}

.filter-row {
  display: flex; 
  align-items: center;
  gap: 10px; 
  margin-top: 10px; 
}

.filter-select option {
  font-size: 14px;
  color: #333;
  background-color: #fff; 
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

.table-button .button:hover {
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

tr {}

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
