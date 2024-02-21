<template>
<el-card :body-style="{ padding: '5px' }">
  <el-collapse>
    <el-collapse-item class="custom-collapse-item">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span class="tool-title">城市介绍工具</span>
        </template>
        <span class="cityInfo">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp{{ truncatedIntroduce }}</span>
        <el-button text v-if="showToggle" @click="toggleIntroduce">{{ toggleText }}</el-button>
        <div style="padding: 10px; border-top:1px solid #909399">
          <span class="title-class">沿途城市介绍</span>
          <div class="bottom">
            <el-cascader style="width:60%" v-model="value" :options="cities" @change="handleChange" placeholder="请选择查询城市" popper-class="custom-popper-class"></el-cascader>
            <el-button text class="button" @click="queryCityInfo" style="margin-right:5px; width:30%; font-weight:700;" :disabled="isDisabled"> 点击查询</el-button>
          </div>
        </div>
     </el-collapse-item>
  </el-collapse>
</el-card>

</template>

<script setup>
import {ref, defineProps, watch, computed} from 'vue'
import { getIntroduceService } from '@/api/ai.js' 
import { Setting } from '@element-plus/icons-vue'


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
.cityInfo {
   color: #909399; 
  font-size: 14px; 
  font-weight: 400;
  padding: 5px;
}
.tip-class {
  color: #909399; 
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
}
.title-class {
  color: #909399; 
  font-size: 18px;
  font-style: italic;
  font-weight: 700;
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
.tool-title {
  color: #909399; 
  font-size: 16px;
  font-weight: 400;
}

.el-collapse-item__content {
  padding-bottom: 0;
}
</style>
