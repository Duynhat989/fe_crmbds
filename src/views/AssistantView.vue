<script setup>
import { ref, computed, onMounted } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { END_POINT } from '@/api/api';
import request from '@/utils/request';
import AddAssistantPopup from '@/components/AddAssistantPopup.vue';
import { notify } from '@kyvg/vue3-notification';
const assistants = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);

const showPopup = ref(false);
const editAssistantId = ref(null);

const addNewAssistant = () => {
  showPopup.value = true;
  editAssistantId.value = null;
};

const editAssistant = (id) => {
  editAssistantId.value = id;
  showPopup.value = true;
};
const deleteAssistant = async (itemId) => {
  let data = JSON.stringify({
    "id": itemId
  });
  const confirmDelete = confirm("Bạn có chắc muốn xóa trợ lý này không?");
  if (confirmDelete) {
    try {
      const response = await request.delete(END_POINT.ASSISTANT_DELETE, {data:data});
      const index = assistants.value.findIndex(a => a.id === itemId);
      if (index !== -1) {
        assistants.value.splice(index, 1, );
      }
      if (response.success) {
        notify({
          title: 'Thành công',
          text: 'Xóa trợ lý thành công ',
          type: 'success'
        });
      } else {
        notify({
          title: 'Lỗi',
          text: 'Xóa trợ lý thất bại. Vui lòng thử lại. ',
          type: 'error'
        });
      }
    } catch (error) {
      notify({
        title: 'Lỗi',
        text: 'Xóa trợ lý thất bại. Vui lòng thử lại. ',
        type: 'error'
      });
    }
  }
};
const closePopup = () => {
  showPopup.value = false;
};
const fetchAssistants = async (page = currentPage.value, limit = itemsPerPage.value) => {
  try {
    const response = await request.get(END_POINT.ASSISTANTS_LIST, {
      params: {
        page,
        limit
      }
    });
    assistants.value = response.data;
    total.value = response.total;
    currentPage.value = response.page;
    itemsPerPage.value = response.limit;
  } catch (error) {
    console.error('Lỗi lấy danh sách trợ lý:', error);
  }
};


const addOrUpdateAssistant = (newAssistant) => {
  if (newAssistant.id) {
    const index = assistants.value.findIndex(a => a.id === newAssistant.id);
    if (index !== -1) {
      assistants.value.splice(index, 1, newAssistant);
    }
  } else {
    assistants.value.push(newAssistant);
  }
};

const totalPages = computed(() => {
  return Math.ceil(total.value / itemsPerPage.value);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchAssistants(currentPage.value, itemsPerPage.value);
  }
};
onMounted(() => {
  fetchAssistants();
});

</script>
<template>
  <div class="main-container">
    <div class="change-type">
    </div>
    <div class="header-title">
      <h1 class="title">Quản lý trợ lý AI</h1>
      <p>Trợ lý AI, công cụ giúp bạn hoàn thiện bản thân.</p>
    </div>
    <div class="main-content">
      <div class="group-button">
        <button class="button" @click="addNewAssistant"><i class='bx bx-message-square-add'></i> Thêm trợ lý</button>
      </div>
      <table class="table" style="border: 1px solid rgba(128, 128, 128, 0.288);;padding: 10px;">
        <thead>
          <tr>
            <th>Số thứ tự</th>
            <th>Tên Trợ Lý</th>
            <th style="min-width: 300px;">Mô tả</th>
            <th>Ảnh đại diện</th>
            <th>Đề xuất tin nhắn</th>
            <th style="width: 150px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in assistants" :key="index">
            <td style="text-align: center;" :data-id="item.id">{{ index }}</td>
            <td style="max-width: 200px;">{{ item.name }}</td>
            <td><input readonly class="input" style="width: 100%;" type="text" v-model="item.detail"></td>
            <td><img width="150"  :src="item.image" alt=""></td>
            <td>
              <div class="lists" v-for="(itemSug, indexSug) in JSON.parse(item.suggests)" :key="indexSug">
                <input readonly style="width: 100%;" class="input" type="text" :value="itemSug">
              </div>
            </td>
            <td class="table-button">
              <button class="button" @click="editAssistant(item.id)"><i class='bx bx-edit-alt'></i> Chỉnh sửa</button>
              <button class="button" @click="deleteAssistant(item.id)"><i class='bx bx-trash'></i> Xóa vĩnh
                viễn</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <span @click="changePage(page)" v-for="(page, index) in totalPages" :class="{ active: currentPage === page }"
          class="page-number">
          {{ page }}</span>
      </div>
    </div>
    <AddAssistantPopup v-if="showPopup" @close="closePopup" :editAssistantId="editAssistantId"
      @submit="addOrUpdateAssistant" />
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
  position: relative;
  padding: 0 5%;
  height: 100dvh;
  overflow-y: scroll;
  padding-bottom: 40px;
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

.change-type {
  position: absolute;
  top: 0;
  right: 0;
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

.button:hover {
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
  text-align: center;
}

td img {
  width: 150px;
  height: 100px;
  object-fit: contain;
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
