<template>
  <chart-box v-show="!isStart" ></chart-box>
  <div v-show="isStart" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 999; width: 30vw">
    <el-alert
    title="Tip"
    type="info"
    description="点击路径标记点可获取旅游攻略"
    show-icon
  />
  </div>
  <el-container  id="box">
      <el-aside id="interactiveItem">
        <img @click="toRefresh" src="@/assets/图片1.png" id="logo">
        <interactiveBox @dataChanged="reciveInfo" />
        <el-row :gutter="12" v-if="statistic.distance" id="statisticData">
          <el-col :span="8">
            <el-card shadow="hover"> 
              <div class="discribeRoute">
                路线全长
              </div>
              <div class="RouteData">
                {{(statistic.distance/1000).toFixed(1)}}km 
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <div class="discribeRoute">驾车时间</div> 
              <div class="RouteData">
                {{(statistic.time/3600.0).toFixed(2)}}h 
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover"> 
              <div class="discribeRoute">
                预计花费
              </div>
              <div class="RouteData">
                {{statistic.toll}}元
              </div>
            </el-card>
          </el-col>
        </el-row>
        <hr v-if="statistic.toll">
        <div class="flex gap-2">
          <div v-if="cityListInfo" class="cityTitle">途 经 城 市</div> <br>
          <el-tag
            v-for="item in cityListInfo"
            :key="item"
            effect="dark"
            round
            class="tagItem"
          >
            {{ item }}
          </el-tag>
        </div>
        <hr v-if="statistic.toll">
        <div class="userUse">欢迎使用!</div>
          <div id="bottomBox">
              <span id="fixedAlert">
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
                         <el-dropdown-item :icon="Folder"  @click="handleRecord">收藏记录</el-dropdown-item>
                       </el-dropdown-menu>
                       <el-dropdown-menu>
                         <el-dropdown-item :icon="Picture"  @click="changeAvatar">更改头像</el-dropdown-item>
                       </el-dropdown-menu>
                       <el-dropdown-menu>
                         <el-dropdown-item :icon="User"  disabled>{{userStore.user.username}}</el-dropdown-item>
                       </el-dropdown-menu>
                     </template>
                   </el-dropdown>
               </span>
              <el-popover 
                id="contactUs" 
                placement="top-start"
                title="联系方式"
                :width="200"
                trigger="hover"
                content="可添加管理员QQ号:1095235717">
                <template #reference>
                  <el-button>联系我们</el-button>
                </template>
              </el-popover>
               <el-popover 
                id="responseQue"
                placement="top-start"
                title="邮箱反馈"
                :width="200"
                trigger="hover"
                content="可将问题发送至邮箱1095235717@qq.com,三个工作日内解决">
                <template #reference>
                  <el-button>问题反馈</el-button>
                </template>
              </el-popover>
          </div>
      </el-aside>
      <el-main id="mapItem">
        <div id="container"></div>
      </el-main>
  </el-container>
  <el-drawer v-show="isStart" id="drawer" v-model="drawerVal" title="城市游玩攻略">
        <el-table :data="travelInfo" style="width: 100%" border>
          <el-table-column  prop="title" :label="`${clickedCity}-精选游玩攻略`">
            <template v-slot="{ row }">
              <!-- <span @click="handleClick(row)" id="guideTitle">{{ row.title }}</span> -->
              
              <el-popover placement="left" trigger="hover" :width="400">
                <template #reference>
                  <span @click="handleClick(row)" id="guideTitle">{{ row.title }}</span>
                </template>
                <el-carousel indicator-position="none">
                  <el-carousel-item v-if="row.img_list" v-for="item in row.img_list" :key="item">
                    <img :src="item" style="width: 100%; height: 100%; ">
                  </el-carousel-item>
                  <el-carousel-item v-else>
                    <p>暂无数据</p>
                  </el-carousel-item>
                </el-carousel>

              </el-popover>

            </template>
          </el-table-column>
        </el-table>
        <span id="warning">以上攻略均来自“去哪儿旅行”，如有侵权，请联系删改。</span>
  </el-drawer>
  <cityIntroduce v-show="isStart" id="gtpQuery" :cityData="cityListInfo" :clickedCity="clickedCity" :travelInfo="travelInfo"></cityIntroduce>
  <el-dialog v-model="dialogTableVisible" title="收藏历史" width="800">
    <el-table :data="recordData">
      <el-table-column prop="time" label="收藏时间" center />
      <el-table-column prop="startCity" label="出发地" center />
      <el-table-column prop="targetCity" label="目的地" center />
    </el-table>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, provide, watch } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useUserStore } from "@/stores/user.js"
import { SwitchButton, User, Picture, Folder } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { userAvatarService, addRecordService, getRecordService } from '@/api/user.js'


const router = useRouter()
const userStore = useUserStore()

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

const recordData = ref()
const dialogTableVisible =  ref(false)
const handleRecord = async() => {
  const res = await getRecordService(userStore.user.uniqueId)
  if(res.data.code === 1) {
    recordData.value = res.data.data
  } else {
    alert('查询失败！请联系管理员查明原因')
  }
 dialogTableVisible.value = true
}



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

const toRefresh = () => {
  location.reload()
}


const avatar = ref('');

const changeAvatar =  () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange =  (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      avatar.value = e.target.result;
      const res = await userAvatarService(userStore.user.uniqueId,avatar.value)
      if(res.data.code === 1) {
        userStore.user.avatarUrl = res.data.data
      } else {
        alert('更新头像失败！')
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

const isStart = ref(false)

const reciveInfo = (originPoint, targetPoint, policyType) => {
  map.clearMap();
  if (polyline.value) {
    map.remove(polyline.value);
  }
  originPlace.value = originPoint
  targetPalce.value = targetPoint
  policy_selected.value = policyType

  amap.plugin('AMap.Geocoder', function() {
    var geocoder = new amap.Geocoder({})
    var address = [originPlace.value, targetPalce.value];
    geocoder.getLocation(address, function(status, result) {
     
      if(status === 'complete' && result.info === 'OK') {
        // result中对应详细地理坐标信息
        try{
        startLng.value = result.geocodes[0].location.lng
        startLat.value = result.geocodes[0].location.lat
        endLng.value = result.geocodes[1].location.lng
        endLat.value = result.geocodes[1].location.lat
        
        amap.plugin("AMap.Driving", function () {
          var driving = new amap.Driving({
            policy: 0, //驾车路线规划策略，0是速度优先的策略
          });
          var startLngLat = [startLng.value, startLat.value]; //起始点坐标
          var endLngLat = [endLng.value, endLat.value]; //终点坐标
          driving.search(startLngLat, endLngLat, function (status, result) {
            //status：complete 表示查询成功，no_data 为查询无结果，error 代表查询错误
            //查询成功时，result 即为对应的驾车导航信息
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
        }
       
        socket.onmessage = function (e) {
           const data = JSON.parse(e.data) // 将接收到的消息转换为JSON对象
           if (data.hasOwnProperty('code') && data.code !== 200) {
              return
            }else if (data.hasOwnProperty('city')) {
              cityListInfo.value =  data.city

              var cityList = data.city;

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
                                      clickedCity.value = result.geocodes[i].formattedAddress
                                      theCity.value = result.geocodes[i].addressComponent.city
                                      travelInfo.value = allData[theCity.value]
                                      drawerVal.value = true
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
                          alert('Geocoding failed with status:', status);
                      }
                  });
              });
            } else if (data.hasOwnProperty('travel_guides')){
              allData[data.name] = data.travel_guides;
            } 
            else {
            }
        }
        }
      catch(error){
        alert('请检查地点输入是否有误！当前仅支持地级市输入！')  
        location.reload();
      } 
    }})
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
    
    setTimeout(()=> {
      isStart.value = true
    },3000)
});

onUnmounted(() => {
  map?.destroy();
});
</script>

<style lang="scss" scoped>
.cityTitle{
  color: #909399; 
  font-size: 16px; 
  font-weight: 700;
  position: absolute;
  transform: translateX(-50%);
  left: 50%;
}

.tagItem {
  margin: 5px;
  margin-left: 10px;
}
 
#box {
  #interactiveItem {
    // background-color: #4d85ed;
    height: 97vh;
    min-width: 250px;
    margin-right: 5px;
    background: url("@/assets/asideImg.png")  ;
    position: relative;
    #statisticData {
      text-align: center;
    }
    #travel {
      background-color: grey;
      margin-top: 50px
    }
    #logo {
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      height: 60px;
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
    transition: 1s;
}
#guideTitle:hover {
  transform: scale(1.2);
}
#gtpQuery {
  position: fixed; 
  top: 1%; 
  left: 70%; 
  z-index: 999; 
  width: 30vw
}
#bottomBox {
  position: absolute;
  bottom: 10px;
  left: 10px;
}

#fixedAlert {
  margin-right: 40px;
}

#drawer {
  position: relative;
}
#warning {
  position: absolute;
  bottom: 5px;
  font-weight: 700;
}
.discribeRoute {
  color: #909399; 
  font-size: 12px; 
  font-weight: 400;
}
.routeData {
  text-align: center;
  color: #909399; 
  font-size: 14px; 
  font-weight: 700;
  margin-top: 5px;
}
.userUse {
  position: fixed;
  bottom: 90px;
  font-size: 32px;
  font-weight: 700;
  margin-left: 80px;
  color: #909399;
  font-style: italic;
}
</style>

