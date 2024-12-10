<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { format } from 'date-fns'
import { notify } from '@kyvg/vue3-notification';

const packages = ref([]);
const license = ref({});
const licenseDate = ref("");
const userData = ref({
    id: 1,
    name: "Hoàng Văn Nam",
    phone: "04954594545",
    email: "45345345345",
    role: 1,
    license: null
})
const props = defineProps({
    user: Object,
    packs: Array,
    isEdit: Boolean,
    showPopup: Boolean
})

const emit = defineEmits(['close', 'saved'])
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      userData.value = { ...newUser };
    }
  },
  { immediate: true }
);

watch(
  () => props.packs,
  (newPackages) => {
    if (newPackages) {
        packages.value = JSON.parse(JSON.stringify(newPackages));
    }
  },
  { immediate: true }
);

const fetchLicenses = async () => {
    try {
        const response = await request.post(END_POINT.LICENSE_FIND, {
            "user_id": userData.value.id
        });
        if (response.success) {
            license.value = response.license
            licenseDate.value = format(new Date(license.value.date), "yyyy-MM-dd");
        }
        const selectedPackage = packages.value.find(
             (item) => item.name === license.value.pack.name
        );
        if (selectedPackage) {
            userData.value.license = selectedPackage.id;
        }
    } catch (error) {
        console.error('Không thể tải danh sách gói cước:', error)
    }
}
const loadUser = async () => {
    await fetchLicenses();
    // await fetchPackages();
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
                    date: licenseDate.value,
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
    <div class="popup-overlay" @click.self="closePopup">
        <div class="popup-container">
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
                    <div class="form-group">
                        <label for="licenseDate">Ngày hết hạn:</label>
                        <input type="date" id="licenseDate" v-model="licenseDate" required />
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
}

.popup-container h2 {
    font-size: 26px;
    color: var(--color-primary);
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
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-primary);
    border-radius: 4px;
    font-size: 1rem;
    background-color: #fff;
    color: #333;
}
input[type="date"] {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s, box-shadow 0.3s;
    appearance: none; 
    background-color: #fff;
    cursor: pointer;
}
input[type="date"]:hover,
input[type="date"]:focus {
    border-color: #007bff;
    box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
    outline: none;
    cursor: text;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    cursor: pointer;
}

input[type="date"]:hover::-webkit-calendar-picker-indicator,
input[type="date"]:focus::-webkit-calendar-picker-indicator {
    opacity: 1;
    visibility: visible;
}

.form-group label {
    margin-bottom: 8px;
    color: #5a5a5a;
    font-size: 14px;
}

input[type="date"]::placeholder {
    color: #999;
}

input[type="date"]:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
}
.form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.save-btn,
.cancel-btn {
    background-color: var(--color-primary);
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
    background-color: #aa2222;
}
</style>
