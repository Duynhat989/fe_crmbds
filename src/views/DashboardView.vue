<script setup>
import { ref, onMounted, computed } from "vue";
import { formatCurrency } from '@/utils/format';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "vue-chartjs";
import { END_POINT } from "@/api/api";
import request from "@/utils/request";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const userStats = ref({
  totalUsers: 0,
  package1Users: 0,
  package2Users: 0,
  package3Users: 0,
});

const revenueToday = ref(0);
const usersToday = ref(0);
const selectedDayRange = ref(7); 
const fetchUserStats = async () => {
  try {
    const response = await request.get(END_POINT.REPOST_USERS);
    if (response.success) {
      userStats.value = response.data;
    }
  } catch (error) {
    console.error("Không thể tải thông tin dữ liệu:", error);
  }
};

// const fetchUserRegistrationData = async () => {
//   try {
//     const response = await request.get(END_POINT.REPOST_USER_NEW);
//     if (response.success) {
//       usersToday.value = response.data.usersToday;
//     }
//   } catch (error) {
//     console.error("Không thể tải thông tin dữ liệu:", error);
//   }
// };

// // Fetch dữ liệu doanh thu
// const fetchRevenueData = async () => {
//   try {
//     const response = await request.get(END_POINT.REPOST_REVENUE);
//     if (response.success) {
//       revenueToday.value = response.data.revenueToday;
//     }
//   } catch (error) {
//     console.error("Không thể tải thông tin dữ liệu:", error);
//   }
// };
const userDayStats = ref([]);
const revenueDayStats = ref([]);

const fetchDayStats = async () => {
  try {
    const userDayResponse = await request.get(`${END_POINT.REPOST_USER_DAY}?days=${selectedDayRange.value}day`);
    const revenueDayResponse = await request.get(`${END_POINT.REPOST_REVENUE_DAY}?days=${selectedDayRange.value}day`);

      if (userDayResponse.success) {
        userDayStats.value = userDayResponse.data.stats;
        usersToday.value = userDayStats.value.length > 0 ? userDayStats.value[0].users : 0; 
      }
      
      if (revenueDayResponse.success) {
        revenueDayStats.value = revenueDayResponse.data.revenueStats;
        revenueToday.value = revenueDayStats.value.length > 0 ? revenueDayStats.value[0].revenue : 0; 
    }
  } catch (error) {
    console.error("Không thể tải thông tin dữ liệu ngày:", error);
  }
};

const userDayChartData = computed(() => ({
  labels: userDayStats.value.map((stat) => stat.date), 
  datasets: [
    {
      label: "Người dùng mới theo ngày",
      data: userDayStats.value.map((stat) => stat.users), 
      borderColor: "#4caf50",
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    },
  ],
}));

const revenueDayChartData = computed(() => ({
  labels: revenueDayStats.value.map((stat) => stat.date),
  datasets: [
    {
      label: "Doanh thu theo ngày (VNĐ)",
      data: revenueDayStats.value.map((stat) => stat.revenue), 
      borderColor: "#f44336",
      backgroundColor: "rgba(244, 67, 54, 0.2)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    },
  ],
}));

const dayChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 14,
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Ngày",
      },
    },
    y: {
      title: {
        display: true,
        text: "Giá trị",
      },
      beginAtZero: true,
    },
  },
};

onMounted(async () => {
  await fetchUserStats();
  await fetchDayStats();
  // await fetchUserRegistrationData();
  // await fetchRevenueData();
});
</script>
<template>
  <div class="main-container">
    <div class="header-title">
      <h1 class="title">An Phát Hưng</h1>
      <h2>Thống kê báo cáo</h2>
    </div>

    <div class="dashboard-cards">
      <div class="card blue">
        <div class="card-icon">
          <i class="bx bxs-user"></i>
        </div>
        <div class="card-content">
          <h3>{{ userStats.totalUsers }}</h3>
          <p>Tổng số người dùng</p>
        </div>
      </div>
      <div class="card green">
        <div class="card-icon">
          <i class="bx bxs-package"></i>
        </div>
        <div class="card-content">
          <h3>{{ userStats.package1Users }}</h3>
          <p>Gói miễn phí</p>
        </div>
      </div>
      <div class="card yellow">
        <div class="card-icon">
          <i class="bx bxs-package"></i>
        </div>
        <div class="card-content">
          <h3>{{ userStats.package2Users }}</h3>
          <p>Gói cơ bản</p>
        </div>
      </div>
      <div class="card red">
        <div class="card-icon">
          <i class="bx bxs-package"></i>
        </div>
        <div class="card-content">
          <h3>{{ userStats.package3Users }}</h3>
          <p>Gói nâng cao</p>
        </div>
      </div>
    </div>
    <div class="date-filter">
      <label for="dayRange">Chọn khoảng thời gian:</label>
      <select id="dayRange" v-model="selectedDayRange" @change="fetchDayStats">
        <option value="3">3 ngày</option>
        <option value="7">7 ngày</option>
        <option value="30">30 ngày</option>
        <option value="60">60 ngày</option>
      </select>
    </div>
    <!-- Biểu đồ -->
    <div class="charts flex">
      <div class="chart-card">
        <h2 class="text-xl">Thống kê đăng ký mới</h2>
        <div class="chart-card__news">
          <div class="card card-chart today">
            <div class="card-content">
              <h3>{{ usersToday }}</h3>
              <p>Đăng ký hôm nay</p>
            </div>
            <div class="card-icon__chart">
              <i class="bx bxs-user-plus"></i>
            </div>
          </div>
          <Line :data="userDayChartData" :options="dayChartOptions" />
        </div>
      </div>

      <!-- Biểu đồ doanh thu -->
      <div class="chart-card">
        <h2 class="text-xl">Thống kê doanh thu</h2>
        <div class="chart-card__news">
          <div class="card card-chart today">
            <div class="card-content">
              <h3> {{ formatCurrency(revenueToday) }}</h3>
              <p>Doanh thu hôm nay</p>
            </div>
            <div class="card-icon__chart">
              <i class="bx bxs-dollar-circle"></i>
            </div>
          </div>
          <Line :data="revenueDayChartData" :options="dayChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.main-container {
  position: relative;
  padding: 0 5%;
  height: 100dvh;
  padding-top: 40px;
  overflow-y: scroll;
  padding-bottom: 40px;
}

.header-title {
  text-align: center;
  margin-bottom: 20px;
}

.header-title .title {
  font-size: 35px;
  font-weight: bold;
  color: var(--color-primary);
  line-height: 56px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.date-filter {
  margin-bottom: 20px;
  margin-top: 20px;
}
.date-filter label {
  margin-right: 10px;
  font-size: 16px;
}
.date-filter select {
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.date-filter select:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  outline: none;
}

.date-filter select:hover {
  border-color: #999;
}

.card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.card-chart {
  width: 100%;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.card-chart .card-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.card-chart .card-icon {
  color: #333;
  font-size: 2rem;
  top: 20px;
}

.card-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.7);
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-icon__chart {
  font-size: 3rem;
  width: 20%;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.card-content p {
  font-size: 1rem;
  color: #666666;
}

/* Màu sắc cho từng loại card */
/* .card.blue {
  background-color: #007bff;
  color: #ffffff;
}

.card.green {
  background-color: #28a745;
  color: #ffffff;
}

.card.yellow {
  background-color: #ffc107;
  color: #ffffff;
}

.card.red {
  background-color: #dc3545;
  color: #ffffff;
} */

.chart-card h2 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  text-align: center;
}

.charts {
  margin-top: 40px;
}

.chart-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: auto;
  /* Đặt chiều cao cố định nhỏ gọn */
  width: 50%;
  margin-bottom: 15px;
}

.chart-card__news {
  display: flex;
  flex-direction: column;
  align-items: self-start;
  gap: 15px;
}

@media (max-width: 1200px) {
  .card-chart {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .charts {
    flex-direction: column;
  }

  .card-chart,
  .chart-card {
    width: 100%;
  }
}
</style>
