import request from '@/utils/request'
export const userLoginService = (email, password ) => {
    return request.post('/user/login', { email, password })
}
export const getVerifyCodeService = (email) => {
    return request.get(`/user/requestVerificationEmail?address=${email}`)
}
export const userRegistService = (username, password, email, code) => {
    return request.post('/user/register', { username, password, email, code })
}