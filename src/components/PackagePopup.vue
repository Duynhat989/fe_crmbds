<script setup>
import { ref, watch } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { notify } from '@kyvg/vue3-notification';

const props = defineProps({
    package: Object,
    isEdit: Boolean,
    featureOptions: Array
})

const emit = defineEmits(['close', 'saved'])
const courses = ref([]);
const assistants = ref([]);
const listFeatures = ref([]);
const packageData = ref({
    id: null,
    name: '',
    description: '',
    price: 0,
    features: [],
    ask: 0
})

const fetchData = async () => {
    try {
        const [coursesResponse, assistantsResponse] = await Promise.all([
            request.get(`${END_POINT.COURSES_LIST}?limit=1000`),
            request.get(`${END_POINT.ASSISTANTS_LIST}?limit=1000`)
        ]);
        courses.value = coursesResponse.courses || [];
        assistants.value = assistantsResponse.data || [];
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
    }
};

const isFeatureSelected = (feature) => {
    return listFeatures.value.some(f => f.id === feature.id && f.type === feature.type);
};

const toggleFeature = (feature) => {
    if (!Array.isArray(packageData.value.features)) {
        try {
            packageData.value.features = JSON.parse(packageData.value.features || '[]');
        } catch (error) {
            packageData.value.features = [];
        }
    }

    const index = packageData.value.features.findIndex(f => f.id === feature.id && f.type === feature.type);
    if (index === -1) {
        packageData.value.features.push({
            type: feature.type,
            id: feature.id,
            name: feature.name
        });
    } else {
        packageData.value.features.splice(index, 1);
    }
};

watch(
    () => props.package,
    async  (newPackage) => {
        if (newPackage) {
            const features = Array.isArray(newPackage.features)
                ? newPackage.features
                : JSON.parse(newPackage.features || '[]');
            packageData.value = {
                id: newPackage.id || null,
                name: newPackage.name || '',
                description: newPackage.description || '',
                price: newPackage.price || 0,
                features: [], 
                ask: newPackage.ask || 0
            };
            listFeatures.value = features;
            
            await fetchData();

            features.forEach((feature) => {
                if (feature.type === 'course') {
                    const course = courses.value.find(c => c.id === feature.id);
                    if (course) packageData.value.features.push(feature);
                } else if (feature.type === 'assistant') {
                    const assistant = assistants.value.find(a => a.id === feature.id);
                    if (assistant) packageData.value.features.push(feature);
                }
            });
        } else {
            packageData.value = {
                id: null,
                name: '',
                description: '',
                price: 0,
                features: [],
                ask: 0
            };
            listFeatures.value = [];
        }
    },
    { immediate: true }
)

const closePopup = () => {
    emit('close')
}

const submitForm = async () => {
    try {
        const dataToSubmit = {
            ...packageData.value,
            features: JSON.stringify(packageData.value.features),
        };
        let response;
        if (props.isEdit) {
            response = await request.post(END_POINT.PACKAGE_UPDATE, dataToSubmit);
        } else {
            response = await request.post(END_POINT.PACKAGE_CREATE, dataToSubmit);
        }
        if (response.success) {
            emit('saved')
            notify({
                title: 'Thành công',
                text: 'Thêm mới || Cập nhật gói cước thành công!',
                type: 'success'
            });
        } else {
            notify({
                title: 'Lỗi',
                text: 'Thêm mới || cập nhật gói cước thất bại, vui lòng thử lại sau.',
                type: 'error'
            });
        }
    } catch (error) {
        console.log(error);
        notify({
            title: 'Lỗi',
            text: 'Đã xảy ra lỗi trong quá trình thêm gói cước. Vui lòng thử lại.',
            type: 'error'
        });
    } finally {
        closePopup();
    }
};

</script>

<template>
    <div class="popup-overlay" @click.self="closePopup">
        <div class="popup-container">
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <h2>{{ isEdit ? 'Chỉnh sửa Gói Cước' : 'Thêm Gói Cước Mới' }}</h2>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="name">Tên gói cước:</label>
                    <input type="text" id="name" v-model="packageData.name" required />
                </div>

                <div class="form-group">
                    <label for="description">Mô tả gói cước:</label>
                    <textarea id="description" v-model="packageData.description" required></textarea>
                </div>

                <div class="form-group">
                    <label for="price">Giá tiền:</label>
                    <input type="number" id="price" v-model="packageData.price" required />
                </div>
                <div class="form-group feature">
                    <label>Tính năng khóa học:</label>
                    <div v-for="course in courses" :key="'course-' + course.id" class="checkbox-item">
                        <input type="checkbox" :id="'course-' + course.id" :value="course.id"
                               :checked="isFeatureSelected({ type: 'course', id: course.id , name: course.name })"
                               @change="toggleFeature({ type: 'course', id: course.id,  name: course.name })">
                        <label :for="'course-' + course.id">{{ course.name }}</label>
                    </div>
                    <label>Tính năng trợ lý:</label>
                    <div v-for="assistant in assistants" :key="'assistant-' + assistant.id" class="checkbox-item">
                        <input type="checkbox" :id="'assistant-' + assistant.id" :value="assistant.id"
                               :checked="isFeatureSelected({ type: 'assistant', id: assistant.id , name: assistant.name })"
                               @change="toggleFeature({ type: 'assistant', id: assistant.id , name: assistant.name })">
                        <label :for="'assistant-' + assistant.id">{{ assistant.name }}</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="requests">Lượt yêu cầu:</label>
                    <input type="number" id="requests" v-model="packageData.ask" required />
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
    max-width: 750px;
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
    color: var(--color-primary);
    transition: color 0.2s ease;
}

.close-btn:hover {
    opacity: 0.8;
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
.form-group.feature {
    max-height: 200px; 
    overflow-y: auto; 
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #495057;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    background-color: #f9f9f9;
    color: #333;
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
    background-color: #e63939;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.checkbox-item input[type="checkbox"] {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
    accent-color: var(--color-primary);
    margin-bottom: 10px;
}

.checkbox-item label {
    font-weight: 500;
    color: #333;
    font-size: 1rem;
    cursor: pointer;
}
</style>