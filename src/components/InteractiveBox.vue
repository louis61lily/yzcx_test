<template>
  <!-- 输入出发点和目的地产生路径	routes
  路径上的点收集起来产生路径连线  ployline
  路径上的点添加标注 点击可以产生城市介绍和游览攻略  点击事件 -->


  <h1 class="title">柚智出行</h1>
  <hr>
  <el-form
    label-position="right"
    label-width="100px"
    id="form"
  >
    <el-form-item label="出发地">
      <el-input v-model="data.originPlace" />
    </el-form-item>
    <el-form-item label="目的地">
      <el-input v-model="data.targetPalce" />
    </el-form-item>
    <!-- <el-form-item label="路线类型">
      <el-radio-group v-model="data.policyType" id="radioGroup">
        <el-radio class="radioItem" border label="速度最快（默认）" :value="0" />
        <el-radio class="radioItem" border label="费用最少" :value="1" />
        <el-radio class="radioItem" border label="距离最短" :value="2" />
      </el-radio-group>
    </el-form-item> -->
    <el-form-item>
       <el-button @click="sendInfo" id="queryBtn" type="primary" plain>生成路线</el-button>
    </el-form-item>
   
  </el-form>
</template>

<script setup> 
import { reactive, getCurrentInstance } from 'vue'

const context = getCurrentInstance(); // 获取当前实例的context
const data = reactive({
    originPlace: '',
    targetPalce: '',
    policyType: 0
})

const sendInfo = () => {
  // this.$emit('dataChanged',data.originPlace,data.targetPalce)
    context.emit('dataChanged', data.originPlace, data.targetPalce,data.policyType);
}

</script>

<style lang="scss" scoped>
.title {
    text-align: center;
    color: rgb(241, 224, 126);
}
#form {
    width: 250px;
    margin-top: 5vh;
    position: relative;
    #radioGroup {
      .radioItem {
        margin-top: 2px;
        color: rgb(241, 224, 126);
      }
    }
    #queryBtn {
      color: rgb(241, 224, 126);
    }
}
</style>