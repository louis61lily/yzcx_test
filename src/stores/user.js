import { defineStore } from 'pinia'
import { ref } from 'vue'

//使用 defineStore 创建一个名为 'users' 的 store (可以理解为一个类的模板)
//可以在应用程序中轻松地访问和管理与用户相关的状态和逻辑
export const useUserStore = defineStore(
    'users',
    () => {
        //const userAvatar = ref('')
        const user = ref({
            // 身份标识、头像、用户名、密码、个性签名、邮箱
            // uniqueId : '',
            // avatar : '',
            // username : '',
            // password : '',
            // sign: '',
            // email : ''
        })
        const setUser = (obj) => (user.value = obj)
        return {
            user,
            setUser
            //userAvatar
        }
    },
    {
        //持久化操作
        persist: true
    }
)
