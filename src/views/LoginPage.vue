<script setup>
import { User, Lock, Message, Tickets} from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import {
  userLoginService,
  getVerifyCodeService,
  userRegistService
} from '@/api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

const form = ref()
// 路由
const router = useRouter()

// 注册登录判断
const isRegister = ref(false)

const userStore = useUserStore()
// 登录逻辑处理
const handleLogin = async function () {
  console.log(loginForm.username,loginForm.password);
  const res = await userLoginService(loginForm.username,loginForm.password)
  console.log(res);
  if (res.data.code === 1) {
    router.push('/home')
    userStore.setUser(res.data.data)
    console.log(userStore.user);
    // userStore.user.username = 'mikano'
  } else {
    alert(res.data.msg)
  }
}

// 注册逻辑处理
const handleRegist = async function() {
  const res = await userRegistService(registForm.username,registForm.password,registForm.email,registForm.code)
  console.log(res)
  if (res.data.code === 1) {
    alert(res.data.msg)
    // userStore.user.username = 'mikano'
  }
}

// 定时器
const remainingTime = ref(60)
const counter = ref(false)
const timer = () => {
  setInterval(() => {
    remainingTime.value -= 1 // 每秒减少1
    if (remainingTime.value === 0) {
      clearInterval(timer) // 停止定时器
      counter.value = false  
    }
  }, 1000)
}
const getVerifyCode = async function() {
  counter.value = true
  timer()
  const res = await getVerifyCodeService(registForm.email)
  if (res.data.code === 1)
  {
    console.log(res);
    alert(res.data.msg)
  } else {
    alert('fail to get verify code!')
  }
  
}

const registForm = reactive(
  {
    username: '',
    password: '',
    email: '',
    code: ''
  }
)

const loginForm = reactive(
  {
    email: '',
    password: ''
  }
)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { min: 3, max: 15, message: '用户名必须是3-15位的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    {
      pattern: /^\S{3,15}$/,
      message: '密码必须是3-15位非空字符',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'change' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请正确输入邮箱',
      trigger: 'blur'
    },
    {
      //三个参数分别是：
      // （1）rule:当前校验规则相关的信息  -----不常用
      // （2）value:所校验表单元素目前的值 -----常用
      // （3）callback:回调函数           -----必用
      //      - callback() 校验成功
      //      - callback(new Error(WrongMsg)) 校验失败
      validator: (rule, value, callback) => {

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailPattern.test(value)) {
          getCode.value = false; // 如果输入的值满足正则表达式，将 getCode.value 设置为 false。
        } else {
          getCode.value = true;
        }
      },
      trigger: 'change'
    }
  ]
}

const getCode = ref(true)


</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg">
      <!-- 后续构建 -->
    </el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form :model="registForm" :rules="rules" size="large" autocomplete="off" v-if="isRegister">
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input 
          :prefix-icon="User" 
          placeholder="请输入用户名" 
          v-model="registForm.username">
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registForm.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            :prefix-icon="Message"
            type="email"
            placeholder="请输入邮箱"
            v-model="registForm.email"
          ></el-input>
        </el-form-item>
         <el-form-item>
          <el-input
            :prefix-icon="Tickets" placeholder="请输入验证码"
            v-model="registForm.code"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button  v-if="!counter" class="button" type="primary"  @click="getVerifyCode" :disabled="getCode">
            获取验证码
          </el-button>
          <el-button v-else class="button" type="primary"  @click="handleRegist" disabled>
            {{remainingTime}}s后可重新获取
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary"  @click="handleRegist">
            注册
          </el-button>
        
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false">
            ← 已有账号？返回
          </el-link>
        </el-form-item>
      </el-form>
      <el-form :model="loginForm" :rules="rules" ref="form" size="large" autocomplete="off" v-else>
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="email">
          <el-input :prefix-icon="User" placeholder="请输入邮箱" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="handleLogin"
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true">
            无账号？前往注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
  @keyframes rotateImage {
   from {
     transform: rotate(0deg); /* 图片开始旋转的角度 */
   }
   to {
     transform: rotate(360deg); /* 图片旋转的最终角度 */
   }
  }
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background: url('@/assets/image.png') no-repeat 50% center / 300px auto ,
     url('@/assets/lbx.png') no-repeat 50% center / 400px auto ;

    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>