<script setup>
import { ref, onMounted ,computed} from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import { formatCurrency } from '@/utils/format';
import { notify } from '@kyvg/vue3-notification';
const payments = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);
const fetchPayments = async () => {
    try {
        const response = await request.get(END_POINT.PAYMENTS_LIST);
        payments.value = response.pays;
        total.value = response.total;
        currentPage.value = response.page;
        itemsPerPage.value = response.limit;
    } catch (error) {
        console.error('Lỗi lấy thông tin gói:', error);
    }
};


const totalPages = computed(() => {
    return Math.ceil(total.value / itemsPerPage.value);
});
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchUsers(currentPage.value, itemsPerPage.value);
    }
};
const getFeatureNames = (features) => {
    const parsedFeatures = JSON.parse(features);
    return `<ul style ="list-style-position: inside;">${parsedFeatures.map(f => `<li>${f.name}</li>`).join('')}</ul>`;
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
    console.log(response);
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
        <div class="main-content">
            <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
                <thead>
                    <tr>
                        <th>Số thứ tự</th>
                        <th>Tên gói cước</th>
                        <th>Mô tả gói cước</th>
                        <th>Giá tiền</th>
                        <!-- <th>Tính năng</th> -->
                        <th>Lượt yêu cầu</th>
                        <th>Người dùng</th>
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
                        <td>{{ pay.user.name }}</td>
                        <td class="table-button">
                            <button class="button" @click="editPayment(pay)"><i class='bx bx-edit-alt'></i> Chỉnh
                                sửa</button>
                            <button class="button" @click="confirmDelete(pay.id)"><i class='bx bx-trash'></i> Xóa vĩnh
                                viễn</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="pagination">
                <span @click="changePage(page)" v-for="(page, index) in totalPages"
                    :class="{ active: currentPage === page }" class="page-number">
                    {{ page }}</span>
            </div>
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
