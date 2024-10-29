<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { notify } from '@kyvg/vue3-notification';

const packages = ref([]);
const license = ref({});
const userData = ref({
    name: "",
    phone: "",
    email: "",
    role: 1,
    license: null
})
const props = defineProps({
    user: Object,
    isEdit: Boolean,
    showPopup: Boolean
})

const emit = defineEmits(['close', 'saved'])

watch(
    () => props.user,
    (newUser) => {
        if (newUser) userData.value = { ...newUser }
    },
    { immediate: true }
)

const fetchPackages = async () => {
    try {
        const response = await request.get(END_POINT.PACKAGES_LIST)
        if (response.success) {
            packages.value = response.packages
            const selectedPackage = packages.value.find(item => item.name === license.value.pack.name)
            if (selectedPackage) {
                userData.value.license = selectedPackage.id
            }
        }
    } catch (error) {
        console.error('Không thể tải danh sách gói cước:', error)
    }
}
const fetchLicenses = async () => {
    try {
        const response = await request.post(END_POINT.LICENSE_FIND, {
            "user_id": userData.value.id
        });
        if (response.success) {
            license.value = response.license
            userData.value.date = license.value.date
        }
    } catch (error) {
        console.error('Không thể tải danh sách gói cước:', error)
    }
}
const loadUser = async () => {
    await fetchLicenses();
    await fetchPackages();
};
onMounted(() => {
    loadUser()
})

const closePopup = () => {
    emit('close');
}

const submitForm = async () => {
    try {
        if (props.isEdit) {
            const response = await request.post(END_POINT.USER_UPDATE, userData.value)
            if (response.success) {
                
                const licenseData = {
                    user_id: userData.value.id,
                    pack_id: userData.value.license,
                    date: userData.value.date,
                    id: license.value.id
                }
                await request.post(END_POINT.LICENSE_UPDATE, licenseData)
                notify({
                    title: 'Thành công',
                    text: 'Cập nhật thông tin người dùng thành công!',
                    type: 'success'
                });
            }
        }
        emit('saved')
        closePopup()
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Cập nhật người dùng thất bại, vui lòng thử lại sau.',
            type: 'error'
        });
    }
};
</script>

<template>
    <div class="popup-overlay">
        <div class="popup-container">
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <h2>Cập nhật Thông Tin Người Dùng</h2>
            <form @submit.prevent="submitForm">
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="name">Tên Người Dùng:</label>
                            <input type="text" id="name" v-model="userData.name" required />
                        </div>

                        <div class="form-group">
                            <label for="phone">Số Điện Thoại:</label>
                            <input type="tel" id="phone" v-model="userData.phone" required />
                        </div>

                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" v-model="userData.email" required />
                        </div>
                        <div class="form-group">
                            <label for="expiredDate">Ngày hết hạn:</label>
                            <input type="date" id="expiredDate" v-model="userData.date" required />
                        </div>
                        <div class="form-group">
                            <label for="role">Vai Trò:</label>
                            <select id="role" v-model="userData.role" required>
                                <option :value="1">Admin</option>
                                <option :value="3">Người Dùng</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-column">
                        <div class="form-group">
                            <label for="license">Gói Cước:</label>
                            <select id="license" v-model="userData.license" required>
                                <option v-for="(item, index) in packages" :key="index" :value="item.id">
                                    {{ item.name }}
                                </option>
                            </select>
                        </div>
                    </div>
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
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: #ae3636;
    transition: color 0.2s ease;
}

.close-btn:hover {
    opacity: 0.8;
}
.popup-container h2 {
    font-size: 26px;
    color: #e63939;
    font-weight: bold;
    margin-bottom: 5px;
    text-align: center;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #495057;
}

.form-group input[type="text"],
.form-group input[type="tel"],
.form-group input[type="email"],
.form-group input[type="date"],
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ff3f3f;
    border-radius: 4px;
    font-size: 1rem;
    background-color: #fff0f0;
    color: #333;
    cursor: pointer;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.save-btn,
.cancel-btn {
    background-color: #ff3f3f;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.save-btn:hover,
.cancel-btn:hover {
    background-color: #e63939;
}
</style>
