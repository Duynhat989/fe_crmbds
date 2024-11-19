<script setup>
import { ref, computed, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import ContractPopup from '@/components/ContractPopup.vue';
import PaginationView from '@/components/Pagination.vue';


const contracts = ref([]);
const showPopup = ref(false)
const selectedContract = ref(null)
const isEdit = ref(false)

const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);


const openPopup = (contract = null, edit = false) => {
  selectedContract.value = contract
  isEdit.value = edit
  showPopup.value = true
}
const addNewContract = () => {
  showPopup.value = true;
  selectedContract.value = null,
    isEdit.value = false
};


const closePopup = () => {
  showPopup.value = false
  selectedContract.value = null
}


const confirmDelete = (contractId) => {
  if (confirm("Bạn có chắc chắn muốn xóa hợp đồng dùng này vĩnh viễn?")) {
    deletecontract(contractId)
  }
}

const deletecontract = async (contractId) => {
  try {
    const response = await request.delete(END_POINT.CONTRACT_DELETE, {
      data: JSON.stringify({ id: contractId })
    });
    contracts.value = contracts.value.filter(contract => contract.id !== contractId)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa hợp đồng thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa hợp đồng:', error)
    notify({
      title: 'Lỗi',
      text: 'Xóa hợp đồng thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}

const fetchContracts = async (page = 1, limit = 10) => {
  try {
    const response = await request.get(END_POINT.CONTRACTS_LIST, {
      params: {
        page,
        limit
      }
    });
    contracts.value = response.contracts;
    total.value = response.total;
  } catch (error) {
    console.error('Lỗi lấy danh sách hợp đồng:', error)
  }
};
const totalPages = computed(() => {
  return Math.ceil(total.value / itemsPerPage.value);
});

const changePage = (page) => {
  currentPage.value = page;
  fetchContracts(currentPage.value, itemsPerPage.value);
};

const getInputNames = (input) => {
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input);
    } catch (error) {
      return '';
    }
  }

  if (!Array.isArray(input)) return '';

  return input.map(item => item.title).join(`<br>`);
};

onMounted(() => {
  fetchContracts();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
      <button class="list">Danh sách</button>
    </div>
    <div class="header-title">
      <h1 class="title">Danh sách hợp đồng</h1>
    </div>
    <div class="main-content">
      <div class="group-button">
        <button class="button" @click="addNewContract"><i class='bx bx-message-square-add'></i> Thêm hợp đồng</button>
      </div>
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>STT</th>
            <th>Hình ảnh</th>
            <th>Tên hợp đồng</th>
            <th>Mô tả</th>
            <th>Mẫu hợp đồng</th>
            <th>Tiêu đề đầu vào</th>
            <th>Trạng thái</th>
            <th style="width: 150px;">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in contracts" :key="item.id">
            <td style="text-align: center;">{{ index + 1 }}</td>
            <td><img :src="item.image" alt="Contract Image" style="width: 50px; height: auto;" /></td>
            <td>{{ item.name }}</td>
            <td>{{ item.description }}</td>
            <td>
              <a  v-if="item.template_contract" :href="item.template_contract">Tải hợp đồng</a>
            </td>
            <td v-html="getInputNames(item.input)"></td>
            <td>{{ item.status === 1 ? 'Hoạt động' : 'Ngừng' }}</td>
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
    <ContractPopup v-if="showPopup" :selectedContract="selectedContract" :isEdit="isEdit" @close="closePopup"
      @saved="fetchContracts" />
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
tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}

.main-container {
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
tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
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
  tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}
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

td a {
  color: blue;
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
tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}

.group-button .button:hover {
  border: 1px solid var(--color-primary);
  background-color: #ffffff;
  color: rgb(255, 0, 0);
  tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}
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
  tr:hover {
  background-color: #aed4d15b;
  cursor: pointer;
}
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
