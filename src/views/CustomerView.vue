<script setup>
import { ref, computed, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import UserPopup from '@/components/UserPopup.vue';


const users = ref([]);
const showPopup = ref(false)
const selectedUser = ref(null)
const isEdit = ref(false)

const currentPage = ref(1);
const itemsPerPage = ref(10);


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

const fetchUsers = async () => {
  try {
    const response = await request.get(END_POINT.USER_LIST);
    users.value = response.data;
    for (const user of users.value) {
      user.license = await fetchLicenses(user.id);
    }

  } catch (error) {
    console.error('Lỗi lấy danh sách người dung:', error)
  }
};

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return users.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(users.value.length / itemsPerPage.value);
});

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
onMounted(() => {
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
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedItems" :key="index">
            <td style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;">{{ item.name }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.role == 1 ? 'Quản trị viên' : 'Người dùng' }}</td>
            <td>{{ item.license?.pack.name }}</td>
            <td class="table-button">
              <button class="button" @click="openPopup(item, true)"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
              <button class="button" @click="confirmDelete(item.id)"><i class='bx bx-trash'></i> Xóa vĩnh viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <span @click="changePage(page)" v-for="(page, index) in totalPages" :class="{ active: currentPage === page }"
          class="page-number">
          {{ page }}</span>
      </div>
    </div>
    <UserPopup v-if="showPopup" :user="selectedUser" :isEdit="isEdit" @close="closePopup" @saved="fetchUsers" />
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

.change-type button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  background-color: #e03d31;
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

td {
  padding: 5px 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.288);
  border-left: 1px solid rgba(128, 128, 128, 0.288);
  margin: 0;
}

tr {}

tr:hover {
  background-color: #e03d315b;
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
  background-color: #e03d31;
  color: white;
}

.group-button .button:hover {
  border: 1px solid #e03d31;
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
  background-color: #e03d31;

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
