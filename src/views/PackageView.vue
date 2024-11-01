<script setup>
import { ref, computed, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import PackagePopup from '@/components/PackagePopup.vue';


const packages = ref([]);
const showPopup = ref(false)
const selectedPackage = ref(null)
const isEdit = ref(false)

const currentPage = ref(1);
const itemsPerPage = ref(8);


const getFeatureNames = (features) => {
  if (typeof features === 'string') {
    try {
      features = JSON.parse(features); 
    } catch (error) {
      return '';
    }
  }

  if (!Array.isArray(features)) return '';

  return features.map(feature => feature.name).join( `<br>`);
};

const addNewPackage = () => {
  showPopup.value = true;
  selectedPackage.value = null,
  isEdit.value = false
};


const openPopup = (pck = null, edit = false) => {
  selectedPackage.value = pck
  isEdit.value = edit
  showPopup.value = true
}


const closePopup = () => {
  showPopup.value = false
  selectedPackage.value = null
}


const confirmDelete = (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa gói này vĩnh viễn?")) {
    deletePackage(id)
  }
}

const deletePackage = async (id) => {
  try {
    const response = await request.delete(END_POINT.PACKAGES_DELETE, {
      data: JSON.stringify({ id: id })
    });
    packages.value = packages.value.filter(pck => pck.id !== id)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa gói thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    notify({
      title: 'Lỗi',
      text: 'Xóa gói thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}

const fetchPackages = async () => {
  try {
    const response = await request.get(END_POINT.PACKAGES_LIST);
    packages.value = response.packages;
  } catch (error) {
    console.error('Lỗi lấy danh sách gói:', error)
  }
};

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return packages.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(packages.value.length / itemsPerPage.value);
});

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
onMounted(() => {
  fetchPackages();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button class="list">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Gói cước AnPhatHung.AI</h1>
    </div>
    <div class="main-content">
      <!-- <div class="group-button">
        <button class="button" @click="addNewPackage"><i class='bx bxs-user-plus'></i> Thêm gói cước</button>
      </div> -->
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Tên gói cước</th>
            <th>Mô tả gói cươc</th>
            <th>Giá tiền</th>
            <th>Tính năng</th>
            <th>Lượt yêu cầu</th>
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedItems" :key="index">
            <td style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;">{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.price }}</td>
            <td v-html="getFeatureNames(item.features)"></td>
            <td>{{ item.ask }}</td>
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
    <PackagePopup v-if="showPopup"  :package="selectedPackage" :isEdit="isEdit" @close="closePopup" @saved="fetchPackages" />
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
