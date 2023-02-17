<template>
    <div class="login" @keyup.enter="onLogin">
       <div class="isLogin">
            <div><span>user</span> <input type="text" v-model="email"/></div>
            <div><span>password</span> <input type="password" v-model="password" /></div>
            <div class="but" > <button @click="onLogin" >登陆</button></div>
            <div class="but" > <button @click="() => { router.push('/register') }" >去注册</button></div>
       </div>
    </div>
    
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '../stores/modules/user';
const userStore = useUserStore() //pinia
const router = useRouter() //路由

const email = ref('') //邮箱
const password = ref('') //密码

//邮箱正则
const zz = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/



const onLogin = async() => {

    const data = {
        email: email.value, //邮箱
        password: password.value //密码
    }

    if(!zz.test(email.value)) return alert('请输入合法邮箱')
    if(password.value.length < 6) return alert('密码长度不得小于6位')

    const { status, msg } = await userStore.login({ email: email.value, password: password.value }) //登陆
    console.log(status);
    if(status !== 0) return alert(msg)

    router.push('/list') //成功后跳转列表页
}

</script>

<style scoped>

.but button{
    padding: 8px 25px;
    width: 100%;
}

.login {
    background: url('../assets/c51ce410c124a10e0db5e4b97fc2af39.jpg') no-repeat 100%/cover;
    display: flex;
    height: 100vh;
    align-items: center;
}

.isLogin{
    width: 100%;
    display: flex;
    flex-direction: column;
}
.isLogin > div{
    width: 80%;
    /* background-color: orange; */
    height: 50px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}


.isLogin > div > span{
    width: 80px;
    text-align: center;
}

.isLogin > div > input{
    flex: 1;
    height: 40px;
}

</style>