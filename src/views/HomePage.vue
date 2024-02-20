<template>
  <div id="fixedAlert" style="position: fixed; top: 90%; left: 1%; z-index: 9999; width: 30vw">
    

      <el-dropdown placement="bottom-end" @command="handleCommand">
        <span class="el-dropdown__box">
          <el-avatar :src="userStore.user.avatarUrl" class="header-img"/>
        </span>
        <!-- 折叠部分 -->
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" :icon="SwitchButton" @click="logouthandeler">退出登录</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" :icon="User"  disabled>{{userStore.user.username}}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
  </div>
  <div id="fixedAlert" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; width: 30vw">
    <el-alert
    title="Tip"
    type="info"
    description="点击路径标记点可获取旅游攻略"
    show-icon
  />
  </div>
    <el-container id="box">
      <el-aside id="interactiveItem">
        <interactiveBox @dataChanged="reciveInfo" />
        <el-row  v-if="statistic.distance" id="statisticData">
          <el-col :span="8">
            <el-statistic title="路线全长" :value="`${statistic.distance/1000}km`" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="花费时间" :value="`${(statistic.time/3600.0).toFixed(2)}h`" />
          </el-col>
          <el-col :span="8">
             <el-statistic title="预计费用" :value="`${statistic.toll}元`" />
          </el-col>
        </el-row>
      </el-aside>
      <el-main id="mapItem">
        <div id="container"></div>
      </el-main>
      <el-aside>
        <cityIntroduce :cityData="cityListInfo" :clickedCity="clickedCity" :travelInfo="travelInfo"></cityIntroduce>
      </el-aside>
    </el-container>
    <el-drawer v-model="drawerVal" title="城市游玩攻略">
        <el-table :data="travelInfo" style="width: 100%" border>
          <el-table-column  prop="title" :label="clickedCity">
            <template v-slot="{ row }">
              <span @click="handleClick(row)" id="guideTitle">{{ row.title }}</span>
            </template>
          </el-table-column>
        </el-table>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, provide, watch } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useUserStore } from "@/stores/user.js"
import { SwitchButton, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
console.log(userStore.user.avatarUrl);

const logouthandeler = () => {
  userStore.setUser({})
  router.push(`/login`)
}


let map = null
let amap = null

const originPlace = ref('')
const targetPalce = ref('')
const startLng = ref('')
const startLat = ref('')
const endLng = ref('')
const endLat = ref('')
const policy_selected = ref(0)
const uid = ref(1)
// 城市列表
const cityListInfo = ref()
// 被点击的城市 用于传递
const clickedCity = ref('')
// 被点击的城市 用于标志
const theCity = ref('')
// 存放所有数据
const allData = ref({})
// 存放传递数据
const travelInfo = ref()
const drawerVal = ref(false)
const polyline = ref(null) 


const statistic = reactive({
  distance : 0,
  time: 0,
  toll: 0,
})

const handleClick = (row) => {
  if (row.url) {
    window.open(row.url, '_blank');
  } else {
    console.error('URL not provided');
  }
};

const reciveInfo = (originPoint, targetPoint, policyType) => {
  // console.log(originPoint, targetPoint);
  map.clearMap();
  if (polyline.value) {
    map.remove(polyline.value);
  }
  originPlace.value = originPoint
  targetPalce.value = targetPoint
  policy_selected.value = policyType
  // console.log(originPlace.value, targetPalce.value);

  amap.plugin('AMap.Geocoder', function() {
    var geocoder = new amap.Geocoder({})
    var address = [originPlace.value, targetPalce.value];
    geocoder.getLocation(address, function(status, result) {
      if (status === 'complete' && result.info === 'OK') {
        // result中对应详细地理坐标信息
        // console.log(result);
        startLng.value = result.geocodes[0].location.lng
        startLat.value = result.geocodes[0].location.lat
        endLng.value = result.geocodes[1].location.lng
        endLat.value = result.geocodes[1].location.lat
        // console.log(startLng.value,startLat.value,endLng.value,endLat.value);

        amap.plugin("AMap.Driving", function () {
          var driving = new amap.Driving({
            policy: 0, //驾车路线规划策略，0是速度优先的策略
          });
          var startLngLat = [startLng.value, startLat.value]; //起始点坐标
          var endLngLat = [endLng.value, endLat.value]; //终点坐标
          driving.search(startLngLat, endLngLat, function (status, result) {
            //status：complete 表示查询成功，no_data 为查询无结果，error 代表查询错误
            //查询成功时，result 即为对应的驾车导航信息
            console.log(result.routes[0].distance,result.routes[0].time,result.routes[0].tolls);
            statistic.distance = result.routes[0].distance
            statistic.time =  result.routes[0].time
            statistic.toll = result.routes[0].tolls
          });
        });

        const info = ref({
          id: "1",
          type: "leading",
          origin:  `${startLng.value},${startLat.value}`,
          destination: `${endLng.value},${endLat.value}`
        })

        const socket = new WebSocket(`ws://1.94.66.195:9197/websocket/1`)
        socket.onopen = function (e) {
          let sendInfo = JSON.stringify(info.value)
            socket.send(sendInfo)
            // console.log(e)
        }
       
        socket.onmessage = function (e) {
           const data = JSON.parse(e.data) // 将接收到的消息转换为JSON对象
           if (data.hasOwnProperty('code') && data.code !== 200) {
              console.log('请求失败!');
              return
            }else if (data.hasOwnProperty('city')) {
              console.log('接收到消息2:', data.city)
              cityListInfo.value =  data.city

              var cityList = data.city;
              // console.log(cityList);
              // console.log(cityList.length);

              const batchSize = 10;
              const cityChunks = [];

              // 算法部分：分组取前算法
              for (let i = 0; i < cityList.length; i += batchSize / 2) {
                  let chunk = cityList.slice(i, i + batchSize);
                  cityChunks.push(chunk);
              }

              cityChunks.forEach(cities => {
                  const citiesToGeocode = cities.flatMap((city, index) => {
                      if (index < cities.length - 1) {
                          return [city, cities[index + 1]];
                      }
                      return [city];
                  });
                
                  geocoder.getLocation(citiesToGeocode, function(status, result) {
                      if (status === 'complete' && result.info === 'OK') {
                          console.log(result, 111111111);
                          if (result.geocodes.length > 0) {
                              const path = [];
                              for (let i = 0; i < result.geocodes.length; i++) {
                                  const lng = result.geocodes[i].location.lng;
                                  const lat = result.geocodes[i].location.lat;
                                  path.push(new amap.LngLat(lng, lat));
                                  const marker = new amap.Marker({
                                      position: new amap.LngLat(lng, lat),
                                      title: result.geocodes[i].formattedAddress,
                                      clickable: true
                                  });
                                  map.add(marker);
                                  marker.on('click', function (event) {
                                      // 在这里编写点击事件的处理逻辑
                                      console.log('Marker 被点击啦！', event);
                                      clickedCity.value = result.geocodes[i].formattedAddress
                                      theCity.value = result.geocodes[i].addressComponent.city
                                      console.log( theCity.value);
                                      travelInfo.value = allData[theCity.value]
                                      console.log(travelInfo.value);
                                      drawerVal.value = true
                                      console.log(drawerVal.value);
                                  });
                              }
                              const polyline = new amap.Polyline({
                                  path: path,
                                  borderWeight: 2,
                                  strokeColor: "blue",
                                  lineJoin: "round"
                              });
                              map.add(polyline);
                              map.setFitView();
                          }
                      } else {
                          console.log('Geocoding failed with status:', status);
                      }
                  });
              });
            } else if (data.hasOwnProperty('travel_guides')){
              allData[data.name] = data.travel_guides;
              console.log(data);
            } 
            else {
              console.log('接收到其他消息:', data)
              // 处理其他类型消息的逻辑
            }
        }
       
      }
    })
  })
}

onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: "2c6ad3cf11ecb6e803bd3dc5f20b3769",
  }
  AMapLoader.load({
    key: "90232868c2c4742b07208d33b1354fde", // 申请好的Web端开发者Key
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.ToolBar", "AMap.HawkEye","AMap.Geocoder"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
  // 加载成功时的返回一个AMap对象
    .then((AMap) => {
      // 设置地图容器id
      amap = AMap
      //console.log(amap);
       map = new AMap.Map("container", {
        viewMode: '3D', //展示类型
        zoom: 11, // 初始化地图的缩放级别
        center: [116.397428, 39.90923], // 初始化地图中心点位置
      })
      //异步加载工具条插件
      AMap.plugin(["AMap.ToolBar", "AMap.HawkEye"], function () {
        //在回调函数中实例化插件
        var toolbar = new AMap.ToolBar(); //创建工具条插件实例
        map.addControl(toolbar); //添加工具条插件到页面
        map.addControl(new AMap.HawkEye());
      })

    })

    .catch((e) => {
      console.log(e);
    });
});

onUnmounted(() => {
  map?.destroy();
});
</script>

<style lang="scss" scoped>
#box {
  #interactiveItem {
    // background-color: #4d85ed;
    height: 97vh;
    min-width: 250px;
    margin-right: 5px;
    #statisticData {
      text-align: center;
    }
    #travel {
      background-color: grey;
      margin-top: 50px
    }
  }
  #mapItem {
    height: 97vh;
    padding: 0;
    min-width: 250px;
    margin-right: 5px;
    #container {
      width: 100%;
      height: 100%;
    }
  }
}
#guideTitle {
    font-size: 14px;
    text-decoration: underline;
    cursor: pointer;
}
</style>

