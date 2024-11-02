<script setup>
import { ref, watch } from 'vue';
import request from '@/utils/request';
import { END_POINT } from '@/api/api';
import { notify } from '@kyvg/vue3-notification';

const contractData = ref({
    id: null,
    name: '',
    description: '',
    image: '',
    input: [],
    template_contract: null
});

const props = defineProps({
    selectedContract: Object,
    isEdit: Boolean
});

const emit = defineEmits(['close', 'saved']);

const closePopup = () => {
    emit('close');
};
watch(
    () => props.selectedContract,
    async (newContract) => {
        if (newContract) {
            contractData.value = {
                ...newContract,
                input: typeof newContract.input === 'string' ? JSON.parse(newContract.input || '[]') : newContract.input,
            };
        } else {
            contractData.value = {
                id: null,
                name: '',
                description: '',
                image: '',
                input: [],
                template_contract: null
            };
        }
    },
    { immediate: true }
);
const addInput = () => {
    contractData.value.input.push({
        keyword: "",
        type: "input",
        title: "",
        value: "",
        required: false,
        placeholder: ""
    });
};

const submitForm = async () => {
    try {
        const formData = new FormData();
        formData.append('name', contractData.value.name);
        formData.append('description', contractData.value.description);
        formData.append('image', contractData.value.image);
        formData.append('input', JSON.stringify(contractData.value.input));

        if (props.isEdit) {
            formData.append('id', contractData.value.id);
        }
        if (contractData.value.template_contract instanceof File) {
            formData.append('template_contract', contractData.value.template_contract);
        }
        const response = await request.post(
            props.isEdit ? END_POINT.CONTRACT_UPDATE : END_POINT.CONTRACT_CREATE,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (!response.success) throw new Error('Lỗi khi xử lý Hợp đồng');

        emit('saved');
        notify({
            title: 'Thành công',
            text: props.isEdit ? 'Cập nhật hợp đồng thành công!' : 'Thêm mới hợp đồng thành công!',
            type: 'success'
        });
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Đã xảy ra lỗi trong quá trình thêm Hợp đồng. Vui lòng thử lại.',
            type: 'error'
        });
    } finally {
        closePopup();
    }
};
</script>

<template>
    <div class="popup-overlay">
        <div class="popup-container">
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <h2>{{ isEdit ? 'Chỉnh sửa Hợp đồng' : 'Thêm Hợp đồng Mới' }}</h2>
            <form @submit.prevent="submitForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="name">Tên Hợp đồng:</label>
                    <input type="text" id="name" v-model="contractData.name" required />
                </div>

                <div class="form-group">
                    <label for="description">Mô tả Hợp đồng:</label>
                    <textarea id="description" v-model="contractData.description" required></textarea>
                </div>

                <div class="form-group">
                    <label for="image">URL Hình ảnh:</label>
                    <input type="text" id="image" v-model="contractData.image" placeholder="Nhập URL hình ảnh" />
                    <img v-if="contractData.image" :src="contractData.image" alt="Hình ảnh Hợp đồng"
                        class="preview-image" />
                </div>

                <div class="form-group">
                    <label for="template_contract">Mẫu Hợp đồng:</label>
                    <input type="file" id="template_contract"
                        @change="e => contractData.template_contract = e.target.files[0]" />
                    <div v-if="contractData.template_contract && typeof contractData.template_contract === 'string'"
                        class="file-preview">
                        <a :href="contractData.template_contract" target="_blank">Tải Xem Mẫu Hợp Đồng</a>
                    </div>
                </div>
                <div class="dynamic-inputs">
                    <label>Thông tin thêm:</label>
                    <div v-for="(input, index) in contractData.input" :key="index" class="input-group">
                        <select v-model="input.type" class="input-type-selector">
                            <option value="input">Nhập thông tin</option>
                            <option value="select">Lựa chọn</option>
                        </select>
                        <input v-model="input.keyword" placeholder="Định dạng keyword" class="input-title" />
                        <input v-model="input.title" placeholder="Tiêu đề" class="input-title" />
                        <input v-model="input.placeholder" placeholder="Placeholder" class="input-title" />

                        <div v-if="input.type === 'select'" class="select-options">
                            <input v-model="input.value" placeholder="Nhập các giá trị cách nhau dấu phẩy"
                                @change="input.value = input.value.split(',').map(option => option.trim())"
                                class="options-input" />
                        </div>
                        <div v-if="input.type === 'input'" class="value-options">
                            <input v-if="input.type === 'input'" v-model="input.value"
                                placeholder="Người dùng nhập giá trị" class="input-value" disabled />
                        </div>
                        <div class="required-field">
                            <label>Bắt buộc:</label>
                            <input type="checkbox" v-model="input.required" />
                            <button type="button" @click="contractData.input.splice(index, 1)"
                                class="remove-btn">Xóa</button>
                        </div>
                    </div>

                    <button type="button" @click="addInput" class="add-btn">Thêm +</button>
                </div>
                <div class="form-actions">
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
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.popup-container {
    background: #fff;
    width: 100%;
    max-width: 1000px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    animation: fadeIn 0.3s ease-in-out;
    overflow: auto;
    height: 90vh;
}

.popup-container::-webkit-scrollbar {
    display: none;
}

.popup-container h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #555;
    margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group input[type="file"],
.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: var(--color-primary);
}

.preview-image {
    max-width: 100px;
    height: auto;
    display: block;
    margin-top: 10px;
    border-radius: 4px;
}

.dynamic-inputs {
    margin-top: 15px;
}

.dynamic-inputs label {
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 8px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.input-type-selector {
    padding: 8px;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.input-title {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
}

.required-field {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: -3px;
}

.value-options,
.select-options {
    display: flex;
    flex-direction: column;
    gap: 0px;
    flex: 1;
}

.options-input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    flex: 1;
}

.dropdown {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    background-color: #f9f9f9;
}

.input-value {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
}

.remove-btn {
    padding: 6px 12px;
    background-color: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 0.9em;
    cursor: pointer;
}

.remove-btn:hover {
    background-color: #c82333;
}

.add-btn {
    padding: 8px 16px;
    background-color: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 1em;
    cursor: pointer;
    margin-top: 10px;
}

.save-btn:hover,
.add-btn:hover {
    opacity: 0.8;
}

.form-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
}

.save-btn {
    background-color: #12a837;
    ;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
}

.cancel-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
}

.cancel-btn:hover {
    background-color: #5a6268;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    color: #333;
    cursor: pointer;
    transition: color 0.3s;
}

.close-btn:hover {
    color: #FF4136;
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
