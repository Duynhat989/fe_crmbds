<script setup>
import { ref, onMounted, watch } from 'vue';

const emit = defineEmits(['close', 'submit']);
import { notify } from '@kyvg/vue3-notification';
import request from '@/utils/request';
import { END_POINT } from '@/api/api';

const assistant_id = ref(null);
const assistantData = ref({
    name: '',
    detail: '',
    image: '',
    instructions: '',
    file_ids: [],
    suggests: [''],
    name_model: 'gpt-4o-mini',
});


const fetchAssistantFind = async () => {
    try {
        if (assistant_id.value !== null) {
            const response = await request.post(END_POINT.ASSISTANT_FIND, { id: assistant_id.value });
            assistantData.value = {
                ...response.data,
                file_ids: JSON.parse(response.data.file_ids),
                suggests: JSON.parse(response.data.suggests),

            };
        }
    } catch (error) {
        console.error('Lỗi lấy danh sách trợ lý:', error);
    }
};

const pendingFiles = ref([]);

const props = defineProps({
    editAssistantId: {
        type: Number,
        default: null,
    }
});

function getDefaultAssistantData() {
    return {
        name: '',
        detail: '',
        image: '',
        instructions: '',
        file_ids: [],
        suggests: [''],
        name_model: 'gpt-4o-mini',
    };
}
const closePopup = () => {
    emit('close');
    assistantData.value = getDefaultAssistantData();
};
const addSuggestion = () => {
    if (!assistantData.value.suggests) {
        assistantData.value.suggests = [];
    }
    assistantData.value.suggests.push('');
};

const removeSuggestion = (index) => {
    assistantData.value.suggests.splice(index, 1);
};

const addFileInput = () => {
    if (!assistantData.value.file_ids) {
        assistantData.value.file_ids = [];
    }
    assistantData.value.file_ids.push('');
    pendingFiles.value.push(null);
};
const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
        pendingFiles.value[index] = file;
    }
};
const uploadFile = async (file) => {
    try {
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file, file.name);
        const response = await request.post(END_POINT.FILE_UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.success) {
            return response.data.id;
        } else {
            notify({
                title: 'Lỗi',
                text: 'Upload file thất bại, vui lòng thử lại sau.',
                type: 'error'
            });
            return null;
        }
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Upload file thất bại, vui lòng thử lại sau.',
            type: 'error'
        });
        console.error("File upload failed:", error);
        return null;
    }
};

const removeFile = async (index) => {
    assistantData.value.file_ids.splice(index, 1);
    pendingFiles.value.splice(index, 1);
};
const submitForm = async () => {
    for (let i = 0; i < pendingFiles.value.length; i++) {
        if (pendingFiles.value[i]) {
            const fileId = await uploadFile(pendingFiles.value[i]);
            if (fileId) {
                assistantData.value.file_ids[i] = fileId;
            }
            else {
                assistantData.value.file_ids[i] = null;
            }
        }
    }
    const dataToSubmit = {
        ...assistantData.value,
        file_ids: assistantData.value.file_ids.filter(id => id),
    };

    const newAssistantForEmit = {
        ...dataToSubmit,
        suggests: JSON.stringify(assistantData.value.suggests),
    };
    try {
        let response;
        if (assistant_id.value) {
            response = await request.post(END_POINT.ASSISTANT_UPDATE, dataToSubmit);
        } else {
            response = await request.post(END_POINT.ASSISTANT_CREATE, dataToSubmit);
        }
        if (response.success) {
            notify({
                title: 'Thành công',
                text: 'Thêm mới & Cập nhật trợ lý thành công!',
                type: 'success'
            });
            emit('submit', newAssistantForEmit);
        } else {
            notify({
                title: 'Lỗi',
                text: 'Thêm mới trợ lý thất bại, vui lòng thử lại sau.',
                type: 'error'
            });
        }
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Đã xảy ra lỗi trong quá trình thêm trợ lý. Vui lòng thử lại.',
            type: 'error'
        });
    } finally {
        closePopup();
    }
}
onMounted(() => {
    if (props.editAssistantId !== null) {
        assistant_id.value = props.editAssistantId;
    }
    fetchAssistantFind();
});

const modelOptions = [
    'gpt-4o',
    'gpt-4o-mini',
];

</script>
<template>
    <div class="popup-overlay">
        <div class="popup-container">
            <h2>{{ editAssistantId ? 'Chỉnh sửa Trợ Lý' : 'Thêm Trợ Lý Mới' }}</h2>
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <form @submit.prevent="submitForm">
                <!-- Cột bên trái -->
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="model">Chọn Model ChatGPT:</label>
                            <select id="model" v-model="assistantData.name_model" required>
                                <option v-for="model in modelOptions" :key="model" :value="model">
                                    {{ model }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="name">Tên Trợ Lý:</label>
                            <input type="text" id="name" placeholder="Nhập tên trợ lý" v-model="assistantData.name" required />
                        </div>
                        <div class="form-group">
                            <label for="detail">Chi tiết:</label>
                            <textarea id="detail" placeholder="Nhập chi tiết"  v-model="assistantData.detail" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="instructions">Hướng dẫn:</label>
                            <textarea id="instructions" v-model="assistantData.instructions" required></textarea>
                        </div>

                        <div class="form-group">
                            <label for="image">Ảnh đại diện:</label>
                            <input type="text" v-model="assistantData.image" placeholder="Thêm link ảnh đại diện">
                            <img v-if="assistantData.image" :src="assistantData.image" alt="Ảnh đại diện"
                                class="preview-image" />
                        </div>
                    </div>

                    <!-- Cột bên phải -->
                    <div class="form-column">
                        <div class="form-group">
                            <label>Đề xuất tin nhắn:</label>
                            <div class="suggest-list">
                                <div v-for="(suggest, index) in assistantData.suggests" :key="index" class="suggest-item">
                                    <input type="text" v-model="assistantData.suggests[index]" placeholder="Tin nhắn" />
                                    <button type="button" @click="removeSuggestion(index)" class="remove-btn">Xóa</button>
                                </div>
                            </div>
                            <button type="button" @click="addSuggestion" class="add-btn">+ Thêm đề xuất</button>
                        </div>

                        <div class="form-group">
                            <label>Tải lên file:</label>
                            <div class="file-list">
                                <div v-for="(file, index) in assistantData.file_ids" :key="index" class="file-item">
                                    <input type="file" @change="handleFileChange($event, index)"
                                        accept=".pdf, .doc, .docx, .xls, .xlsx" />
                                    <span>{{ file }}</span>
                                    <button type="button" @click="removeFile(index)" class="remove-btn">Xóa</button>
                                </div>
                            </div>

                            <button type="button" @click="addFileInput" class="add-btn">+ Thêm file</button>
                        </div>
                    </div>
                </div>
                <!-- Nút lưu và hủy -->
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
    max-width: 1300px;
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    position: relative;
}

.popup-container h2 {
    font-size: 26px;
    color: var(--color-primary);
    font-weight: bold;
    margin-bottom: 5px;
    width: 100%;
    text-align: center;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    color: var(--color-primary);
    transition: color 0.2s ease;
}

.close-btn:hover {
    opacity: 0.8;
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
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-primary);
    border-radius: 4px;
    font-size: 1rem;
    background-color: #fff;
    color: #333;
}

form {
    width: 100%;
}

.form-row {
    display: flex;
    gap: 20px;
    width: 100%;
}

.form-column {
    flex: 1;
    min-width: 300px;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    width: 100%;
}

.add-btn,
.remove-btn,
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
    margin-top: 0.5rem;
}

.remove-btn {
    margin-top: 0;
}

.add-btn:hover,
.remove-btn:hover,
.save-btn:hover,
.cancel-btn:hover {
    background-color: var(--color-primary);
}
.save-btn {
    background-color: #28a745;
}
.suggest-item,
.file-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.suggest-item input[type="text"],
.file-item input[type="file"] {
    flex: 1;
    margin-right: 0.5rem;
}

.form-group input[type="file"] {
    border: 1px solid var(--color-primary);
    background-color: #fff0f0;
    padding: 8px;
    border-radius: 4px;
    color: var(--color-primary);
    cursor: pointer;
    width: 100%;
}

.form-group input[type="file"]::file-selector-button {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
}

.form-group input[type="file"]::file-selector-button:hover {
    background-color: var(--color-primary);
}

.preview-image {
    margin-top: 10px;
    max-width: 100px;
    border-radius: 8px;
    object-fit: cover;
}
form .form-group {
  margin-bottom: 15px;
}

form .form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

form .form-group select {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

form .form-group select:focus {
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
  outline: none;
}

form .form-group select:hover {
  border-color: #007bff;
}
.suggest-list,
.file-list {
    max-height: 250px;
    overflow: auto;
    padding-right: 10px;
}
</style>
