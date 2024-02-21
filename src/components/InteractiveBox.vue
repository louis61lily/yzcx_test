<template>
  <!-- 输入出发点和目的地产生路径	routes
  路径上的点收集起来产生路径连线  ployline
  路径上的点添加标注 点击可以产生城市介绍和游览攻略  点击事件 -->


  <h1 class="title">柚 智 出 行</h1>
  <hr>
  <el-form
    label-position="right"
    label-width="100px"
    id="form"
  >
    <el-form-item label="出发地">
      <el-input v-model="data.originPlace" placeholder="请输入出发地"/>
    </el-form-item>
    <el-form-item label="目的地">
      <el-input v-model="data.targetPalce" placeholder="请输入目的地" />
    </el-form-item>
    <el-form-item>
       <el-button  @click="sendInfo" id="queryBtn" type="warning" >生成路线 &nbsp&nbsp&nbsp<el-icon><Position /></el-icon></el-button>
    </el-form-item>
  </el-form>
  <hr>
</template>

<script setup> 
import { reactive, getCurrentInstance } from 'vue'
import { Position } from '@element-plus/icons-vue'
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
    color:#E6A23C;
}
#form {
    width: 250px;
    margin-top: 5vh;
    position: relative;
    #radioGroup {
      .radioItem {
        margin-top: 2px;
        color: #E6A23C;
      }
    }
    #queryBtn {
      color: rgb(241, 224, 126);
    }
}
</style>