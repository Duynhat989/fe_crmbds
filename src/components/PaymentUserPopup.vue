<script setup>import { ref, onMounted } from 'vue';
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import PaginationView from '@/components/Pagination.vue';
import { formatCurrency } from '@/utils/format';

const props = defineProps({
    user_id: Number,
    startday: String,
    endday: String,
    status_pay: Number,
});

const payments = ref([]);
const total = ref(0);
const count = ref(0);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchPayments = async () => {
    try {
        isLoading.value = true;
        const queryParams = new URLSearchParams({
            user_id: props.user_id,
            status_pay: props.status_pay,
            startday: props.startday,
            endday: props.endday,
            page: currentPage.value,
            limit: itemsPerPage.value,
        }).toString();

        const response = await request.post(`${END_POINT.PAYMENTS_FIND}?${queryParams}`, {});

        payments.value = response.pays || [];
        total.value = response.total || 0;
        count.value = response.count || 0;
        currentPage.value = response.page;
        itemsPerPage.value = response.limit;
    } catch (error) {
        console.error('Lỗi khi gọi API PAYMENTS_FIND:', error);
    } finally {
        isLoading.value = false;
    }
};
const changePage = (page) => {
    currentPage.value = page;
    fetchPayments();
};
const getStatusText = (status) => {
    switch (status) {
        case 1: return 'Chờ xử lý';
        case 2: return 'Đã thanh toán';
        case 3: return 'Đã hủy';
        default: return 'Không xác định';
    }
};

onMounted(() => {
    fetchPayments();
});

</script>
<template>
    <div class="popup-overlay">
        <div class="popup-container">
            <div class="popup-header">
                <h2>Chi tiết thanh toán người dùng</h2>
                <button class="close-btn" @click="$emit('close')">Đóng</button>
            </div>

            <div class="popup-content">
                <div v-if="isLoading" class="loading">Đang tải dữ liệu...</div>

                <div v-else>
                    <div v-if="payments.length === 0" class="no-data">
                        <p>Không có dữ liệu thanh toán để hiển thị.</p>
                    </div>

                    <div v-else>
                        <p><strong>Tổng số giao dịch:</strong> {{ count }}</p>
                        <p><strong>Tổng số tiền thanh toán:</strong> {{ formatCurrency(total) }}</p>

                        <table class="payment-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mã hóa đơn</th>
                                    <th>Gói cước</th>
                                    <th>Thời hạn (tháng)</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="payment in payments" :key="payment.id">
                                    <td>{{ payment.id }}</td>
                                    <td>{{ payment.invoice_code || '' }}</td>
                                    <td>{{ payment.package_id }}</td>
                                    <td>{{ payment.extension_period }}</td>
                                    <td>{{ formatCurrency(payment.must_pay) || 'Không có' }}</td>
                                    <td>{{ getStatusText(payment.status_pay) }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Phân trang -->
                        <PaginationView :total="count" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
                            @changePage="changePage" />
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>


<style scoped>
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 800px;
    max-width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.popup-header h2 {
    margin: 0;
    color: var(--color-primary);
}

.close-btn {
    background: #ff4d4d;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
}

.close-btn:hover {
    background: #ff3333;
}

.popup-content {
    font-size: 14px;
}

.payment-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.payment-table th,
.payment-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
}

.payment-table th {
    background-color: #f4f4f4;
}

.loading {
    text-align: center;
    font-size: 16px;
    color: #555;
}
.no-data {
    text-align: center;
    color: #555;
    font-size: 16px;
    margin-top: 20px;
}

</style>