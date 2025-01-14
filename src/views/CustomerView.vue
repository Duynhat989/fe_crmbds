<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import UserPopup from '@/components/UserPopup.vue';
import PaginationView from '@/components/Pagination.vue';


import * as XLSX from "xlsx";

const exportToExcel = async () => {
  isLoading.value = true
  textLoading.value = "Đang tải dữ liệu"
  // console.log(dataTemp)
  let dataTemp = await fetchUsers(1, total.value + 5, searchQuery.value, selectedDateTime.value, selectedPackage.value, true);
  // console.log(dataTemp)
  try {
    const data = dataTemp.map((user, index) => ({
      "Số thứ tự": index + 1,
      "Tên người dùng": user.name,
      "Số điện thoại": user.phone,
      "Email": user.email,
      "Quyền": user.role == 1 ? "Quản trị viên" : "Người dùng",
      "Gói cước": user.license?.pack?.name || "Không có",
      "Ngày hết hạn": user.license?.date || "Không có",
    }));
    //MAP DỮ LIỆU 

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách người dùng");

    XLSX.writeFile(workbook, "Danh_sach_nguoi_dung.xlsx");
  } catch (error) {

  }
};
const searchQuery = ref('');

const users = ref([]);
const showPopup = ref(false)
const selectedUser = ref(null)
const isEdit = ref(false)

const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);


const selectedDateTime = ref('');
const packages = ref([]);
const selectedPackage = ref('');
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
const fetchUsers = async (page = 1, limit = 10, search = searchQuery.value, date = selectedDateTime.value, pack = selectedPackage.value, isSet = false) => {
  try {
    const response = await request.get(END_POINT.USER_LIST, {
      params: {
        search,
        page,
        limit,
        date,
        pack
      }
    });
    if (!isSet) {
      users.value = response.data;
      total.value = response.total;
      currentPage.value = response.page;
      itemsPerPage.value = response.limit;
      for (const user of users.value) {
        user.license = await fetchLicenses(user.id);
      }
    } else {
      let tempUsers = response.data;
      let index = 0
      for (const user of tempUsers) {
        user.license = await fetchLicenses(user.id);
        textLoading.value = `Dữ liệu tải xuống được ${index}/${tempUsers.length}`
        index++
      }
      isLoading.value = false
      return tempUsers
    }
    isLoading.value = false
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
  [searchQuery, selectedDateTime, selectedPackage],
  ([newQuery, newDate, newPackage]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fetchUsers(currentPage.value, itemsPerPage.value, newQuery, newDate, newPackage);
    }, 500);
  }
);

onMounted(() => {
  fetchPackages();
  fetchUsers();
});
// xử lý loading
const isLoading = ref(false)
const textLoading = ref('Hi')
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
        <div class="filter-column">
          <label for="packageFilter" class="filter-label">Gói cước:</label>
          <select id="packageFilter" v-model="selectedPackage" class="filter-select">
            <option value="">Tất cả</option>
            <option v-for="pack in packages" :key="pack.id" :value="pack.id">
              {{ pack.name }}
            </option>
          </select>
        </div>
        <div class="filter-column">
          <label for="expirationDate" class="filter-label">Ngày sắp hết hạn:</label>
          <input type="date" id="expirationDate" v-model="selectedDateTime" class="filter-date"
            aria-label="Chọn ngày và giờ" />
        </div>
        <div class="filter-column">
          <label class="filter-label">&nbsp;</label>
          <button class="button export-button" @click="exportToExcel">
            <i class='bx bx-export'></i> Xuất Excel
          </button>
        </div>
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
            <th>Ngày tạo</th>
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
            <td>{{ item.createdAt.split('T')[0] }}</td>
            <td class="table-button">
              <button class="button" @click="openPopup(item, true)"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
              <button class="button" @click="confirmDelete(item.id)"><i class='bx bx-trash'></i> Xóa vĩnh viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
      <PaginationView :total="total" :itemsPerPage="itemsPerPage" :currentPage="currentPage" @changePage="changePage" />
    </div>
    <UserPopup v-if="showPopup" :packs="packages" :user="selectedUser" :isEdit="isEdit" @close="closePopup"
      @saved="fetchUsers" />
    <div class="loading" v-if="isLoading">
      <div class="loading_content">
        <div class="icon"><i class='bx bx-loader bx-spin'></i></div>
        <div class="text">
          {{ textLoading }}
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.loading {
  position: fixed;
  background-color: white;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 9999;
  padding-top: 10%;
}

.loading .icon {
  font-size: 1.5em;
}

.loading_content {
  text-align: center;
}

.header-title {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 10px;
}

.header-title .title {
  font-size: 30px;
  font-weight: bold;
  color: var(--color-primary);
  line-height: 40px;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  width: 60%;
  margin: 0 auto;
  margin-bottom: 30px;
}

.search-row {
  position: relative;
  width: 100%;
}

.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.filter-column {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.filter-label {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  border: none;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.25);
}

.filter-select option {
  color: #333;
  background-color: #fff;
  padding: 5px;
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


.date-filter label {
  font-size: 0.9rem;
  color: #666;
}

.filter-date {
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid #fff;
  border-radius: 25px;
  font-size: 1rem;
  min-width: 200px;
  cursor: pointer;
}

.filter-date:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

.filter-date:hover {
  border-color: #007bff;
}

.export-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 20px;
  cursor: pointer;
  height: 40px;
  width: max-content;
}

.export-button:hover {
  object-fit: 0.7;
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

  .filter-row {
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-bar {
    width: 100%;
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
