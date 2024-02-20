<template>
      <el-card :body-style="{ padding: '0px' }">
        <div>
          <span>{{ truncatedIntroduce }}</span>
          <el-button v-if="showToggle" @click="toggleIntroduce">{{ toggleText }}</el-button>
        </div>
        <div style="padding: 10px">
          <span>沿途城市介绍</span>
          <div class="bottom">
             <el-cascader style="width:60%" v-model="value" :options="cities" @change="handleChange" placeholder="请选择查询城市"/>
            <el-button text class="button" @click="queryCityInfo" style="margin-right:5px; width:30%" :disabled="isDisabled"> 点击查询</el-button>
          </div>
        </div>
      </el-card>
</template>

<script setup>
import {ref, defineProps, watch, computed} from 'vue'
import { getIntroduceService } from '@/api/ai.js' 


// 接收父组件传值
const props = defineProps({
  cityData: {
    type: Array,
    default: []
  },
  clickedCity: {
    type: String,
    default: '未选择'
  },
  travelInfo: {
    type: Array,
    default:[]
  }
});
const isDisabled = ref(true)

const cities = ref(props.cityData)
// 处理传值格式
const transformData = (data) => {
  return data.map(city => ({
    value: city,
    label: city,
    children: []
  }));
};

// 监听props.cityData的变化，并更新cities的格式
watch(() => props.cityData, (newVal) => {
  cities.value = transformData(newVal);
});

watch(() => props.clickedCity, (newVal) => {
  console.log(props.clickedCity);
});

watch(() => props.travelInfo, (newVal) => {
  console.log(props.travelInfo);
});

const cityStr = ref('')
const introduce = ref('')

const showToggle = ref(false);
const isExpanded = ref(false);

const truncatedIntroduce = computed(() => {
  if (introduce.value.length > 50 && !isExpanded.value) {
    showToggle.value = true;
    return introduce.value.slice(0, 50) + '...';
  }
  return introduce.value;
});

const toggleText = computed(() => {
  return isExpanded.value ? '收起' : '展开';
});

const toggleIntroduce = () => {
  isExpanded.value = !isExpanded.value;
};

const handleChange = async (cityValue) => {
    cityStr.value = cityValue
    isDisabled.value = false
    console.log(cityStr.value);
}
const queryCityInfo = async() => {
    // 调ai
    const res = await getIntroduceService(cityStr.value)
    console.log(res);
    introduce.value = res.data
}

</script>

<style>
.time {
  font-size: 12px;
  color: #0e4272;
}

.bottom {
  margin-top: 10px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button {
  padding: 0;
  min-height: auto;
}

.image {
  width: 100%;
  display: block;
}
</style>
