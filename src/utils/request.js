import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 暂时占位,暂无地址
const baseURL = 'http://1.94.66.195:9197'

const instance = axios.create({
    baseURL,
    timeout: 10000
})

// 请求拦截器
// instance.interceptors.request.use(
//     (config) => {
//         const userStore = useUserStore()
//         if (userStore.token) {
//             // 获取用户存储的 token，并将其添加到请求的请求头中的 Authorization 字段中。
//             // console.log(userStore.token)
//             config.headers.Authorization = userStore.token
//         }
//         return config
//     },
//     (err) => Promise.reject(err)
// )

// 响应拦截器
instance.interceptors.response.use(
    (res) => {
        // 获取请求状态码
        if (res.data.code === 1 || res.data.code === 0) {
            return res
        }
        //在响应拦截器中，首先判断响应的状态码是否为 1 或 0。如果是，则返回响应数据。
        //如果响应状态码不为 1 或 0，使用 ElMessage 组件显示错误消息，并返回一个被拒绝的 Promise 对象。
        ElMessage({ message: res.data.message || '服务异常', type: 'error' })
        return Promise.reject(res.data)
    },
    (err) => {
        ElMessage({
            message: err.response.data.message || '服务异常',
            type: 'error'
        })
        console.log(err)
        // 获取网络状态码
        if (err.response?.status === 401) {
            router.push('/login')
        }
        return Promise.reject(err)
    }
)

export default instance
export { baseURL }
