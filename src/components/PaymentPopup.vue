<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { format } from 'date-fns'
import { notify } from '@kyvg/vue3-notification';

const packages = ref({});
const users  = ref([]);

const paymentData =  ref({
    user_id: '',
    status_pay: 1, 
    invoice_code: '',
    must_pay: '',
    package_id: '',
    extension_period: 1,
    message_code: '',
    id: null,
});

const props = defineProps({
    selectedPayment: Object,
    isEdit: Boolean,
    showPopup: Boolean
})

const emit = defineEmits(['close', 'saved'])
const resetForm = () => {
    paymentData.value = {
        user_id: '',
        status_pay: 1, 
        invoice_code: '',
        must_pay: '',
        package_id: '',
        extension_period: 1,
        message_code: '',
        id: null, 
    };
};

const fetchPackages = async () => {
    try {
        const response = await request.get(END_POINT.PACKAGES_LIST);
        packages.value = response.packages;
    } catch (error) {
        console.error('Lỗi lấy danh sách gói:', error)
    }
};
const fetchPaymentsByUser = async (query) => {
    try {
        const response = await request.get(END_POINT.PAYMENTS_FIND_USER);
        users.value = response.data;
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
    }
};
watch(
    () => props.selectedPayment,
    (newPayment) => {
        if (newPayment) {
            console.log(newPayment);
            paymentData.value = {
                user_id: newPayment.user_id,
                status_pay: newPayment.status_pay,
                invoice_code: newPayment.invoice_code || '',
                must_pay: newPayment.must_pay,
                package_id: newPayment.package_id,
                extension_period: newPayment.extension_period,
                message_code: newPayment.message_code || '',
                id: newPayment.id,
            };
        }else {
            resetForm();
        }
    },
    { immediate: true }
)

const closePopup = () => {
    emit('close');
}

const submitForm = async () => {
    try {
        const dataToSubmit = {
            ...paymentData.value,
            status_pay: Number(paymentData.value.status_pay),
        };
        let response;
        if (props.isEdit) {
            response = await request.post(END_POINT.PAYMENT_UPDATE, dataToSubmit);
        } 
        if (response.success) {
            emit('saved')
            notify({
                title: 'Thành công',
                text: 'Thêm mới || Cập nhật thanh toán thành công!',
                type: 'success'
            });
        } else {
            notify({
                title: 'Lỗi',
                text: 'Thêm mới || cập nhật thanh toán thất bại, vui lòng thử lại sau.',
                type: 'error'
            });
        }
        closePopup()
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Cập nhật thanh toán thất bại, vui lòng thử lại sau.',
            type: 'error'
        });
    }
};
onMounted(() => {
    fetchPackages();
    fetchPaymentsByUser();
});
</script>

<template>
    <div class="popup-overlay" @click.self="closePopup">
        <div class="popup-container">
            <h2>{{ props.isEdit ? 'Cập nhật' : 'Thêm' }} Thông Tin Thanh toán</h2>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="invoice_code">Mã hóa đơn:</label>
                    <input type="text" id="invoice_code" v-model="paymentData.invoice_code"
                        placeholder="Nhập mã hóa đơn"  />
                </div>
                <div class="form-group">
                    <label for="user_id" >Người dùng:</label>
                    <select id="user_id" v-model="paymentData.user_id">
                        <option value="" disabled>Chọn người dùng</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }} - {{ user.email }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="must_pay">Số tiền:</label>
                    <input type="number" id="must_pay" v-model="paymentData.must_pay" placeholder="Nhập số tiền" />
                </div>

                <div class="form-group">
                    <label for="status_pay">Trạng thái thanh toán:</label>
                    <select id="status_pay" v-model.number="paymentData.status_pay">
                        <option value="" disabled>Trạng thái</option>
                        <option :value="1">Chờ</option>
                        <option :value="2">Đã thanh toán</option>
                        <option :value="3">Hủy</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="package_id">Gói dịch vụ:</label>
                    <select id="package_id" v-model="paymentData.package_id">
                        <option value="" disabled>Chọn gói dịch vụ</option>
                        <option v-for="pkg in packages" :key="pkg.id" :value="pkg.id">
                            {{ pkg.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="extension_period">Thời gian gia hạn (tháng):</label>
                    <input type="number" id="extension_period" v-model="paymentData.extension_period"
                        placeholder="Nhập thời gian gia hạn" />
                </div>

                <div class="form-group">
                    <label for="message_code">Mã nội dung:</label>
                    <input type="text" id="message_code" v-model="paymentData.message_code"
                        placeholder="Nhập mã nội dung" />
                </div>

                <div class="form-group form-actions">
                    <button type="submit" class="save-btn">Lưu</button>
                    <button type="button" @click="closePopup" class="cancel-btn">Hủy</button>
                </div>
            </form>
        </div>
    </div>
</template>


<style scoped>
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.popup-container {
    width: 90%;
    max-width: 600px;
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.popup-container h2 {
    font-size: 26px;
    color: var(--color-primary);
    font-weight: bold;
    margin-bottom: 5px;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
    /* Khoảng cách giữa các nhóm form */
}

.form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    /* Khoảng cách dưới nhãn */
    color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    font-size: 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    /* Bao gồm padding và border trong kích thước */
}

.form-group textarea {
    resize: vertical;
    /* Chỉ cho phép thay đổi chiều cao */
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    border-color: #007bff;
    /* Màu viền khi focus */
    outline: none;
    /* Xóa viền focus mặc định */
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    /* Hiệu ứng focus */
}

.form-actions {
    display: flex;
    justify-content: start;
    gap: 20px;
    margin-top: 20px;
}

.save-btn,
.cancel-btn {
    padding: 10px 20px;
    font-size: 1em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}

.save-btn {
    background-color: #007bff;
    color: #fff;
}

.save-btn:hover {
    background-color: #c22c27;
}

.cancel-btn {
    background-color: #ccc;
    color: #333;
}

.cancel-btn:hover {
    background-color: #aaa;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
