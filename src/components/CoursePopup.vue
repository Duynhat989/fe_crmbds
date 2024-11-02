<script setup>
import { ref, watch, onMounted } from 'vue'
import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { notify } from '@kyvg/vue3-notification';

const fetchCourses = async () => {
    try {
        const response = await request.post(END_POINT.COURSE_FIND, {
            "id": courseData.value.id
        });

        if (response.success) {
            courseData.value.lessons = response.data.lessons.map(lesson => ({
                ...lesson,
                isHidden: true
            }));
        }
    } catch (error) {
        console.error('Không thể tải danh sách bài học', error)
    }
}
const toggleLessonVisibility = (index) => {
    courseData.value.lessons[index].isHidden = !courseData.value.lessons[index].isHidden
}

const props = defineProps({
    selectedCourse: Object,
    isEdit: Boolean
})

const emit = defineEmits(['close', 'saved'])

const courseData = ref({
    id: null,
    name: '',
    detail: '',
    image: '',
    status: 1,
    price: 0,
    sign_in: [],
    lessons: "[]"
})

watch(
    () => props.selectedCourse,
    async (newCourse) => {
        if (newCourse) {
            courseData.value = {
                ...newCourse,
                lessons: []
            }
            await fetchCourses();
        } else {
            courseData.value = {
                name: '',
                detail: '',
                image: '',
                status: 1,
                price: 0,
                sign_in: "[]",
                lessons: []
            }
        }
    },
    { immediate: true }
)

const addLesson = () => {
    courseData.value.lessons.push({
        name: '',
        detail: '',
        image: '',
        indexRow: courseData.value.lessons.length + 1,
        url_video: '',
        course_id: 0,
        isHidden: false
    })
}

const removeLesson = (id, name, index) => {
    if (!id || !name) {
        if (index >= 0 && index < courseData.value.lessons.length) {
            courseData.value.lessons.splice(index, 1);
        } 
        return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa bài học ${name} này vĩnh viễn?`)) {
        deleteLesson(id)
    }
}

const deleteLesson = async (id) => {
    try {
        const response = await request.delete(END_POINT.LESSON_DELETE, {
            data: JSON.stringify({ id: id })
        });
        if (response.success) {
            courseData.value.lessons = courseData.value.lessons.filter(lessons => lessons.id !== id)
            notify({
                title: 'Thành công',
                text: 'Xóa bài học thành công ',
                type: 'success'
            });
        }
    } catch (error) {
        console.error('Lỗi khi xóa bài học:', error)
        notify({
            title: 'Lỗi',
            text: 'Xóa bài học thất bại. Vui lòng thử lại. ',
            type: 'error'
        });
    }
}
const closePopup = () => {
    emit('close')
}
const handleLessons = async (courseId, lessons) => {
    for (const lesson of lessons) {
        lesson.course_id = courseId;
        const endpoint = lesson.id ? END_POINT.LESSON_UPDATE : END_POINT.LESSON_CREATE;

        const response = await request.post(endpoint, lesson);
        if (!response.success) {
            throw new Error(`Lỗi khi xử lý bài học ID: ${lesson.id || 'mới'}`);
        }
    }
};

const submitForm = async () => {
    try {
        const dataToSubmit = {
            ...courseData.value,
        };
        let response;
        response = await request.post(props.isEdit ? END_POINT.COURSE_UPDATE : END_POINT.COURSE_CREATE, dataToSubmit);
        if (!response.success) throw new Error('Lỗi khi xử lý khóa học');
        const courseId = props.isEdit ? dataToSubmit.id : response.data.id;
        courseData.value.lessons = courseData.value.lessons.map(lesson => ({
            ...lesson,
            course_id: courseId
        }));

        await handleLessons(courseId, courseData.value.lessons);
        emit('saved');
        notify({
            title: 'Thành công',
            text: props.isEdit ? 'Cập nhật khóa học và bài học thành công!' : 'Thêm mới khóa học và bài học thành công!',
            type: 'success'
        });
    } catch (error) {
        notify({
            title: 'Lỗi',
            text: 'Đã xảy ra lỗi trong quá trình thêm khóa học. Vui lòng thử lại.',
            type: 'error'
        });
    } finally {
        closePopup();
    }
};

const loadCoures = async () => {
    await fetchCourses();
};
onMounted(() => {
    // loadCoures()
});

</script>

<template>
    <div class="popup-overlay" @click.self="closePopup">
        <div class="popup-container">
            <button class="close-btn" @click="closePopup"><i class="bx bxs-x-circle"></i></button>
            <h2>{{ isEdit ? 'Chỉnh sửa Khóa Học' : 'Thêm Khóa Học Mới' }}</h2>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="name">Tên khóa học:</label>
                    <input type="text" id="name" v-model="courseData.name" required />
                </div>

                <div class="form-group">
                    <label for="detail">Mô tả khóa học:</label>
                    <textarea id="detail" v-model="courseData.detail" required></textarea>
                </div>

                <div class="form-group">
                    <label for="image">URL Hình ảnh:</label>
                    <input type="text" id="image" v-model="courseData.image" placeholder="Nhập URL hình ảnh" />
                    <img v-if="courseData.image" :src="courseData.image" alt="Hình ảnh khóa học"
                        class="preview-image" />
                </div>

                <div class="form-group">
                    <label>Trạng thái:</label>
                    <select v-model="courseData.status" required>
                        <option :value="1">Hoạt động</option>
                        <option :value="0">Ngừng hoạt động</option>
                    </select>
                </div>

                <!-- Thêm các bài học -->
                <div class="lessons-section">
                    <h3>Bài học kèm theo</h3>
                    <div v-for="(lesson, index) in courseData.lessons" :key="lesson.id" class="lesson-item">
                        <button type="button" class="toggle-lesson-btn" @click="toggleLessonVisibility(index)">
                            <i v-if="lesson.isHidden" class='bx bxs-show'></i>
                            <i v-else class="bx bx-filter"></i>
                        </button>

                        <div v-show="!lesson.isHidden">
                            <div class="form-group">
                                <label>Tên bài giảng:</label>
                                <input type="text" v-model="lesson.name" placeholder="Nhập tên bài giảng" required />
                            </div>

                            <div class="form-group">
                                <label>Mô tả bài giảng:</label>
                                <textarea v-model="lesson.detail" placeholder="Nhập mô tả bài giảng"
                                    required></textarea>
                            </div>

                            <div class="form-group">
                                <label>URL Hình ảnh:</label>
                                <input type="text" v-model="lesson.image" placeholder="Nhập URL hình ảnh" />
                                <img v-if="lesson.image" :src="lesson.image" alt="Hình ảnh bài giảng"
                                    class="preview-image" />
                            </div>

                            <div class="form-group">
                                <label>Thứ tự hiển thị:</label>
                                <input type="number" v-model="lesson.indexRow" min="1" required />
                            </div>

                            <div class="form-group">
                                <label>URL Video:</label>
                                <input type="text" v-model="lesson.url_video" placeholder="Nhập URL video" required />
                            </div>

                            <button type="button" class="remove-lesson-btn"
                                @click="removeLesson(lesson.id, lesson.name ,index)">Xóa bài
                                học</button>
                        </div>
                    </div>
                    <button type="button" class="add-lesson-btn" @click="addLesson">+ Thêm bài học</button>
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
    max-width: 900px;
    background-color: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
    max-height: 90vh;
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

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #495057;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    background-color: #f9f9f9;
    color: #333;
}

.form-group textarea {
    height: 200px;
}

.preview-image {
    margin-top: 10px;
    max-width: 100px;
    border-radius: 8px;
    object-fit: cover;
}

.lessons-section {
    margin-top: 2rem;
}

.lesson-item {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
}

.add-lesson-btn,
.remove-lesson-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    display: block;
    transition: background-color 0.3s;
}

.remove-lesson-btn {
    background-color: var(--color-primary);
}

.add-lesson-btn:hover {
    background-color: var(--color-primary);
}

.remove-lesson-btn:hover {
    background-color: #c82333;
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
.save-btn {
    background-color: #28a745;
}

.save-btn:hover,
.cancel-btn:hover {
    background-color: var(--color-primary);
}

.toggle-lesson-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 3px 5px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s;
}

.toggle-lesson-btn:hover {
    opacity: 0.8;
}

.remove-lesson-btn {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    transition: background-color 0.3s;
}

.remove-lesson-btn:hover {
    background-color: #c82333;
}
</style>
