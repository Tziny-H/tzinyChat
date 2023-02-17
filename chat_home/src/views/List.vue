<template>
    <div class="list ">
        <div class="list_title"> 发消息 </div>
        <div class="list_user_message" >
                <div v-for="item in userList" @click="onRouterById(item)" :key="item" class="list_user_message_item">
                    <div class="user_image">
                        <img :src="item.avatar" alt="">
                    </div>
                    <div class="user_info">
                        <div class="user_info_name"><span>{{ item.user_name }}</span> <span>{{ filterMessageNum(item.id) }}</span></div>
                        <div class="user_info_message">{{ filterMessage(item.id) }}</div>
                    </div>
                </div>
        </div>
        <!-- <div class="message_alert">

        </div> -->
    </div>
</template>

<script setup>
import useUserStore from '@/stores/modules/user';
import { io } from 'socket.io-client'
import { nextTick, onMounted, ref } from 'vue';
import { getToken, setUid } from '../utlis/cookie';
import { useRouter } from 'vue-router';
const userStore = useUserStore() //pinia
const router = useRouter() //路由实例
userStore.userObj = {} //清空聊天对象

const userList = ref([]) //聊天用户列表
const messageArr = ref([]) //当前用户消息提示列表

//建立websockie连接
const websocket = io('http://127.0.0.1:2095/userlist',{
    auth: {  
     token: getToken(),
    }
})

//sockie连接体
websocket.on('connect', socket => {
    //将连接绑定id
    websocket.emit('setRoomById', userStore.userId + '')
    console.log(userStore.userId); //用户自己的id

    //获取聊天列表，获取消息提示
    websocket.on('getUserList', (data, code) => {

        const { status, response, message } = data //status 状态 response 用户列表 message 消息提示

        if(status !== 0) return alert(response) 

        if(response.length < 1) return alert('现在用户过少，快邀请好友来注册吧')
     
        //将用户列表去除自己
        userList.value = response?.filter(e => {
            return e.id !== userStore.userId
        })

        messageArr.value = message 
        // if(code  == 1) alert('未读消息' +  messageArr.value)
    })

})

onMounted(() => {
    nextTick(() => {
        //将用户列表去除自己
        userList.value = userList.value?.filter(e => {
            console.log(e.id);
            return e.id !== userStore.userId
        })
    })
})

/**
 * 判断有误与该用户聊天过
 * @param {Nunber} id 聊天对象id
 * @returns {String} 消息提示
 */
const filterMessage = id => {
    if(messageArr.value.length < 1) return '你们还未进行互动，快点开始聊天吧'
    const message = messageArr.value?.find(e => e.id == id)
    return message ? message.msg : '你们还未进行互动，快点开始聊天吧'
}

/**
 * 判断消息提示列表里对应的id消息数量
 * @param {*} id 聊天对象id
 * @returns {String} 消息s数量
 */
const filterMessageNum = id => {
    if(messageArr.value.length < 1) return '0'
    const message = messageArr.value?.find(e => e.id == id)
    return message ? message.num : '0'
}

/**
 * 获取聊天对象信息，跳转聊天页
 * @param {*} item 
 */
const onRouterById = (item) => {
    userStore.onRouterById(item)
}

</script>

<style scoped>
.list{
    display: flex;
    height: 100vh;
    flex-direction: column;
    margin: 0 auto;
}
.list_title{
    width: 100%;
    height: 40px;
    text-align: center;
    line-height: 40px;
    color: #FFF;
    background-color: orange;
}
.list_user_message{
    flex: 1;
    background-color: #f4f4f5;
    overflow-y: scroll;
    overflow-x: hidden;
    user-select: none;
    cursor: pointer;
    padding: 5px 0 10px 10px;
    /* -ms-overflow-style: none;
    scrollbar-width: none;  */
}

.list_user_message::-webkit-scrollbar {
  /* display: none; /* Chrome Safari  */
  width: 10px;
}

.list_user_message::-webkit-scrollbar-thumb {
  /* display: none; /* Chrome Safari  */
  height: 5px;
  background-color: #c4c1c0;
  border-radius: 5px;
}


.list_user_message_item{
    width: 100%;
    height: 50px;
    display: flex;
    margin: 1px;
    background-color: #FFF;
}
.user_image {
    width: 50px;

    margin: 5px 5px;
    display: flex;
}

.user_image > img{
    width: 100%;
    object-fit: cover;
}
.user_info{
    flex: 1;
    display: flex;
    flex-direction: column;
}

.user_info_name{
    display: flex;
    justify-content: space-between;
    margin: 0 10px;
    color: #303133;
}
.user_info_message{
    margin: 0 10px;
    font-size: 14px;
    color: #909399;
    overflow: hidden;
    white-space: nowrap;
   text-overflow: ellipsis;
   max-width: 350px;
}
/* 
.message_alert{
    width: 40%;
    height: 40px;
    background-color: rgba(0, 0, 0, .5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
} */
</style>