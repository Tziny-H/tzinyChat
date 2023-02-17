<template>
    <div class="login">
        <div class="register">
            <div><span>user</span> <input type="text" v-model="email"/></div>
            <div><span>password</span> <input type="password" v-model="password" /></div>
            <div><span>captcha</span> <input  v-model="captcha"  maxlength="4" /></div>
            <div class="but" > <button @click="onCaptcha" >获取验证码</button></div>
            <div class="but" > <button @click="onRegister" >注册</button></div>
            <div class="but" > <button @click="() => { router.push('/login') }" >已有账号，去登陆</button></div>
        </div>
    </div>
    
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '../stores/modules/user';
const userStore = useUserStore() //pinia
const router = useRouter() //路由实例

const email = ref('') //邮箱
const password = ref('') //密码
const captcha = ref('') //验证码

//邮箱正则
const zz = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * 获取验证码
 */
const onCaptcha = async() => {
    const captcha = axios.post('http://127.0.0.1:2095/api/register/code', { email: email.value }) 
}
//图片列表
const avatarList = []
/**
 * 注册
 */
const onRegister = async() => {

    const res = {
        email: email.value, //邮箱
        avatar: avatarList[Math.floor(Math.random() * avatarList.length)], //随机图片
        password: password.value, //密码
        code: captcha.value //验证码
    }

    if(!zz.test(email.value)) return alert('请输入合法邮箱')
    if(password.value.length < 6) return alert('密码长度不得小于6位')
    if(captcha.value.length < 4) return alert('请输入4位数验证码')

    const { data } = await axios.post('http://127.0.0.1:2095/api/register', res) //注册请求
    console.log(data);
    if(data.status !== 0) return alert(msg)
    //注册成功后登陆
    const date = await userStore.login({ email: email.value, password: password.value })
    if(date.status !== 0) return router.push('/login')
    //登陆成功后路由
    router.push('/list')
}

</script>

<style scoped>

.but button{
    padding: 8px 25px;
    width: 100%;
}

.login {
    background: url('../assets/d3d9446802a44259755d38e6d163e820.jpg') no-repeat 100%/cover;
    display: flex;
    height: 100vh;
    align-items: center;
}
.register{
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
}
.register > div{
    width: 80%;
    /* background-color: orange; */
    height: 50px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.register > div > span{
    width: 80px;
    text-align: center;
}

.register > div > input{
    flex: 1;
    height: 40px;
}

</style>