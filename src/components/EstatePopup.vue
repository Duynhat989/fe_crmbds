<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { notify } from '@kyvg/vue3-notification';
const isLoading = ref(false);

const estateData = ref({
    title: '',
    image: '',
    base_url: '',
    description: '',
    area: '',
    price: '',
    location: '',
    exten: '',
    status: 1,
});

const props = defineProps({
    selectedEstale: {
        type: Object,
        default: null,
    },
    isEdit: {
        type: Boolean,
        default: false,
    },
});

const closePopup = () => {
    emit('close');
};

const emit = defineEmits(['close', 'saved'])
const resetForm = () => {
    estateData.value = {
        title: '',
        image: '',
        base_url: '',
        description: '',
        area: '',
        price: '',
        location: '',
        exten: '',
        status: 1,
    };
};
watch(
    () => props.selectedEstale,
    (newVal) => {
        if (newVal) {
            estateData.value = { ...newVal };
        } else {
            resetForm();
        }
    },
    { immediate: true }
);

const submitForm = async () => {
    try {
        isLoading.value = true;
        const dataToSubmit = {
            ...estateData.value,
            ...(props.isEdit && { id: props.selectedEstale.id })
        };
        const endpoint = props.isEdit ? END_POINT.ESTALE_UPDATE : END_POINT.ESTALE_CREATE;
        const response = await request.post(endpoint, dataToSubmit);
        if (!response.success) throw new Error('Lỗi khi xử lý bài viết');

        emit('saved');
        notify({
            title: 'Thành công',
            text: props.isEdit ? 'Cập nhật bài viết thành công!' : 'Thêm mới bài viết thành công!',
            type: 'success'
        });
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Đã xảy ra lỗi trong quá trình thêm bài viết. Vui lòng thử lại.',
            type: 'error'
        });
    } finally {
        isLoading.value = false;
        closePopup();
    }
};

</script>
<template>
    <div class="popup-overlay">
        <div class="popup-container">
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <h2>{{ isEdit ? "Chỉnh sửa bài viết" : "Thêm bài viết mới" }}</h2>
            <form @submit.prevent="submitForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="title">Tên tiêu đề:</label>
                        <input type="text" id="title" v-model="estateData.title" required />
                    </div>
                    <div class="form-group">
                        <label for="base_url">Đường dẫn URL:</label>
                        <input type="text" id="base_url" v-model="estateData.base_url" required />
                    </div>
                    <div class="form-group">
                        <label for="exten">Chi tiết mở rộng:</label>
                        <input type="text" id="exten" v-model="estateData.exten" />
                    </div>
                    <div class="form-group">
                        <label for="area">Diện tích:</label>
                        <input type="text" id="area" v-model="estateData.area" />
                    </div>
                    <div class="form-group">
                        <label for="location">Vị trí:</label>
                        <input type="text" id="location" v-model="estateData.location" />
                    </div>
                    <div class="form-group">
                        <label for="price">Giá:</label>
                        <input type="text" id="price" v-model="estateData.price" />
                    </div>
                    <div class="form-group">
                        <label for="description">Mô tả:</label>
                        <textarea id="description" v-model="estateData.description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="keyword">Nhập thông tin Keyword:</label>
                        <textarea id="keyword" v-model="estateData.keyword"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="status">Trạng thái:</label>
                        <select id="status" v-model="estateData.status">
                            <option value="1">Có sẵn</option>
                            <option value="2">Đã bán</option>
                            <option value="3">Chưa giải quyết</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="image">URL Hình ảnh:</label>
                        <input type="text" id="image" v-model="estateData.image" />
                        <img v-if="estateData.image" style="margin-top: 20px;" width="100" height="100"
                            :src="estateData.image" alt="Hình ảnh">
                    </div>
                </div>
                <div class="popup-actions">
                    <button type="submit" class="save-btn" :disabled="isLoading">
                        <span v-if="isLoading">
                            <i class="bx bx-loader bx-spin"></i> Đang lưu...
                        </span>
                        <span v-else>Lưu</span>
                    </button>
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 800px;
    max-width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #555;
}

.popup-container h2 {
    font-size: 24px;
    color: var(--color-primary);
    font-weight: bold;
    margin-bottom: 5px;
    width: 100%;
    text-align: center;
}

form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.form-group {
    flex: 1 1 calc(50% - 15px);
}

label {
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 5px;
}

input[type="text"],
textarea,
select {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
}

textarea {
    resize: vertical;
    height: 300px;
}

.popup-actions {
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    gap: 20px;
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
</style>
