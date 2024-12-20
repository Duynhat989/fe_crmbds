<script setup>
import { ref, onMounted ,watch } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import { formatCurrency } from '@/utils/format';
import { notify } from '@kyvg/vue3-notification';
import PaginationView from '@/components/Pagination.vue';
import PaymentPopup from '@/components/PaymentPopup.vue';
// import PaymentUserPopup from '@/components/PaymentUserPopup.vue';

const payments = ref([]);
const users  = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);

const showPopup = ref(false)
const selectedPayment = ref(null)
const isEdit = ref(false)

// const showUserPopup = ref(false);
const selectedUserId = ref(null);
const selectedStatus = ref('');
const startday = ref(''); 
const endday = ref(''); 

// const addNewPayment = () => {
//   showPopup.value = true;
//   isEdit.value = false
//   selectedPayment.value = null;
// };
const selectUser = async (user) => {
    // searchQuery.value = user.name;
    selectedUserId.value = user.id; 
    // showUserPopup.value = true; 
    await fetchPayments();
    users.value = []; 
};
// const closePaymentUserPopup = () => {
//   showUserPopup.value = false;
// };
const editPayment = (pay = null, edit = false) => {
    selectedPayment.value = pay
  isEdit.value = edit
  showPopup.value = true;
};
const closePopup = () => {
  showPopup.value = false
  selectedPayment.value = null
}

const searchQuery = ref('');

const fetchPaymentsByUser = async (query) => {
    try {
        const response = await request.get(END_POINT.PAYMENTS_FIND_USER, {
            params: {
                'search': query,
            }
        });
        users.value = response.data;
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
    }
};
let timeout;
watch(
  searchQuery,
  (newQuery) => {
    try { clearTimeout(timeout) } catch (error) { }
    timeout = setTimeout(() => {
        if (newQuery.trim()) {
            fetchPaymentsByUser(newQuery); 
        } 
        if (!newQuery.trim()) {
            users.value = [];
            return;
        }
    }, 1000)
  }
);

const fetchPayments = async () => {
    try {
        const queryParams = new URLSearchParams({
            status_pay: selectedStatus.value || '',
            startday: startday.value || '',
            endday: endday.value || '',
            page: currentPage.value || 1,
            limit: itemsPerPage.value || 10,
            user_id: selectedUserId.value || ""
        }).toString();

        const response = await request.get(`${END_POINT.PAYMENTS_LIST}?${queryParams}`, {});

        payments.value = response.pays;
        total.value = response.total;
        currentPage.value = response.page;
        itemsPerPage.value = response.limit;
    } catch (error) {
        console.error('Lỗi lấy thông tin gói:', error);
    }
};
const changePage = (page) => {
  currentPage.value = page;
  fetchPayments(currentPage.value, itemsPerPage.value);
};
const getStatusClassAndText = (status) => {
  switch (status) {
    case 1:
      return { text: 'Chờ', class: 'status-pending' }; 
    case 2:
      return { text: 'Đã thanh toán', class: 'status-paid' };
    case 3:
      return { text: 'Hủy', class: 'status-cancelled' }; 
    default:
      return { text: 'Không xác định', class: 'status-unknown' }; 
  }
};


const confirmDelete = (id) => {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này vĩnh viễn?")) {
    deletePay(id)
  }
}
const deletePay = async (id) => {
  try {
    const response = await request.delete(END_POINT.PAYMENT_DELETE, {
      data: JSON.stringify({ id: id })
    });
    payments.value = payments.value.filter(pay => pay.id !== id)
    if (response.success) {
      notify({
        title: 'Thành công',
        text: 'Xóa thành công ',
        type: 'success'
      });
    }
  } catch (error) {
    notify({
      title: 'Lỗi',
      text: 'Xóa thất bại. Vui lòng thử lại. ',
      type: 'error'
    });
  }
}
onMounted(() => {
    fetchPayments();
});
</script>

<template>
    <div class="main-container">
        <div class="change-type">
            <button class="list">Danh sách</button>
        </div>
        <div class="header-title">
            <h1 class="title">Quản lý thanh toán</h1>
        </div>
        <div class="filter-bar">
            <div class="search-row">
                <i class='bx bx-search-alt-2 search-icon'></i>
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Tìm kiếm theo tên người dùng..." 
                    v-model="searchQuery" 
                />
                <div v-if="users.length > 0" class="search-results">
                    <ul>
                        <li v-for="user in users" :key="user.id" @click="selectUser(user)">
                            {{ user.name }} - {{ user.email }}
                        </li>
                    </ul>
                </div>
            </div>

            <div class="filter-row">
                <label for="status-select">Trạng thái:</label>
                <select id="status-select" v-model.number="selectedStatus" @change="fetchPayments">
                    <option value="">Tất cả</option>
                    <option value="1">Chờ xử lý</option>
                    <option value="2">Đã thanh toán</option>
                    <option value="3">Đã hủy</option>
                </select>
            </div>

            <div class="date-filter-row">
                <label for="startday">Ngày bắt đầu:</label>
                <input type="date" id="startday" v-model="startday" @change="fetchPayments" />
                
                <label for="endday">Ngày kết thúc:</label>
                <input type="date" id="endday" v-model="endday" @change="fetchPayments" />
            </div>
        </div>
        <div class="main-content">
            <div class="group-button">
                <!-- <button class="button" @click="addNewPayment"><i class='bx bx-message-square-add'></i> Thêm mới</button> -->
            </div>
            <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
                <thead>
                    <tr>
                        <th>Số thứ tự</th>
                        <th>Tên gói cước</th>
                        <th>Mô tả gói cước</th>
                        <th>Giá tiền</th>
                        <th>Lượt yêu cầu</th>
                        <th>Người dùng</th>
                        <th>SĐT</th>
                        <th>Trạng thái</th>
                        <th style="width: 150px;">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(pay, index) in payments" :key="pay.id">
                        <td style="text-align: center;">{{ index + 1 }}</td>
                        <td style="max-width: 200px;">{{ pay.package.name }}</td>
                        <td>{{ pay.package.description }}</td>
                        <td>{{ formatCurrency(pay.must_pay) }}</td>
                        <!-- <td v-html="getFeatureNames(pay.package.features)"></td> -->
                        <td>{{ pay.package.ask }}</td>
                        <td>{{ pay?.user?.name }}</td>
                        <td>{{ pay?.user?.phone }}</td>
                        <td style="text-align: center;">
                            <span :class="`status ${getStatusClassAndText(pay.status_pay).class}`"> {{ getStatusClassAndText(pay.status_pay).text }}</span>
                        </td>
                        <td class="table-button">
                            <button class="button" @click="editPayment(pay,true)"><i class='bx bx-edit-alt'></i> Chỉnh
                                sửa</button>
                            <button class="button" @click="confirmDelete(pay.id)"><i class='bx bx-trash'></i> Xóa vĩnh
                                viễn</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <PaginationView :total="total" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
            @changePage="changePage" />
        </div>
        <PaymentPopup v-if="showPopup" :selectedPayment="selectedPayment" :isEdit="isEdit" @close="closePopup"
            @saved="fetchPayments" />
        <!-- <PaymentUserPopup 
            v-if="showUserPopup"
            :user_id="selectedUserId"
            :startday="startday"
            :endday="endday"
            :status_pay="selectedStatus"
            @close="closePaymentUserPopup"
        /> -->
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
    margin: 40px auto;
    position: relative;
    padding: 0 5%;
    height: 100dvh;
    overflow-y: scroll;
    padding-bottom: 100px;
}.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 15px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
}

.search-row {
    display: flex;
    align-items: center;
    flex: 1 1 300px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.search-input:focus {
    border-color: #007bff;
}

.search-icon {
    position: absolute;
    right: 10px;
    font-size: 18px;
    color: #888;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
}

.search-results ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.search-results li {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.search-results li:hover {
    background-color: #f0f0f0;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filter-row select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.filter-row select:focus {
    border-color: #007bff;
}

.date-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1 1 300px;
}

.date-filter-row label {
    font-size: 14px;
    color: #333;
}

.date-filter-row input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.date-filter-row input:focus {
    border-color: #007bff;
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
/* Cơ bản */
.status {
    font-weight: bold;
    padding: 5px 15px;
    border-radius: 4px;
    text-align: center;
    display: inline-block;
}

.status-pending {
    background-color: #fff3cd; 
    color: #856404; 
}

.status-paid {
    background-color: #d4edda; 
    color: #155724; 
}

.status-cancelled {
    background-color: #f8d7da; 
    color: #721c24; 
}

.status-unknown {
    background-color: #d1ecf1; 
    color: #0c5460; 
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
