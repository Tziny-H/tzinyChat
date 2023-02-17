<template>
  <div class="about">
    <div class="popover" v-if="popover"  @click.stop="popover = false">
      <img :src="popoverImage" alt="" class="popover-img">
    </div>
    <div class="title">{{ userStore.userObj.user_name}}</div>
      <div class="center" ref="box">
        <template v-for="(item, index) in list" :key="index">
          <div :class="{ msg: true, left: item.sid == userId? true : false, rigth: item.uid == userId? true : false }" >
            <div  v-if="item.uid != userId" class="avatar">
              <img :src="userStore.userObj.avatar" alt="" />
            </div>
            <div v-if="item.type == 'text'" class="cenbox">
              <div>
                {{ item.center }}
              </div>
            </div>
            <div v-if="item.type == 'image'" class="image cenbox">
              <img 
                :src="item.center"  
                @click="DomWidth <= 375 ? changeImage(item.center) : ''"
                @dblclick="DomWidth > 375 ? changeImage(item.center) : ''"
              alt="">
            </div>
            <div  v-if="item.uid == userId">
              <img :src="userStore.avatar" alt=""/>
            </div>
          </div>
        </template>
      </div>
      <div class="submit">
        <textarea id="txt" v-model="text" @keyup.enter="onInputRequest('text')" placeholder="请输入，使用回车发送"></textarea>
        <div class="but">
          <div class="files">
            <svg t="1676274046899" @click="uploadFile" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1717" width="36" height="36"><path d="M128 853.333333h768.064L896 170.666667H127.936L128 853.333333zM127.936 128h768.128C919.594667 128 938.666667 146.986667 938.666667 170.666667v682.666666c0 23.573333-19.029333 42.666667-42.602667 42.666667H127.936A42.56 42.56 0 0 1 85.333333 853.333333V170.666667c0-23.573333 19.029333-42.666667 42.602667-42.666667z m200.128 527.082667c22.890667-19.626667 68.48-36.416 98.794667-36.416h20.949333c40.533333 0 95.914667-20.437333 126.549333-46.698667l52.373334-44.885333c22.890667-19.626667 68.48-36.416 98.794666-36.416H810.666667a21.333333 21.333333 0 0 0 0-42.666667h-85.12c-40.533333 0-95.936 20.437333-126.570667 46.698667l-52.373333 44.885333C523.690667 559.210667 478.165333 576 447.786667 576h-20.949334c-40.490667 0-95.914667 20.437333-126.549333 46.698667L199.445333 709.12a21.333333 21.333333 0 1 0 27.776 32.384l100.842667-86.442667z" fill="#3D3D3D" p-id="1718"></path><path d="M352 373.333333m-53.333333 0a53.333333 53.333333 0 1 0 106.666666 0 53.333333 53.333333 0 1 0-106.666666 0Z" fill="#3D3D3D" p-id="1719"></path></svg>
            <input type="file" name="" id="file" @change="onFile" title="" accept=".jpg, .jpeg, .png" />
          </div>
          <div class="send">
            <button @click="onInputRequest('text')">发送</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { nextTick, onUnmounted,ref, watch, onMounted } from 'vue'
import { io } from 'socket.io-client'
import useUserStore from '@/stores/modules/user';
import { useRouter } from 'vue-router';
import { getUid, getToken } from '../utlis/cookie';
import dayjs from 'dayjs'
import axios from 'axios';
const userStore = useUserStore() //pinia 
const router = useRouter() //路由实例

const roomId = ref('')  //房间号id
const userId = ref('') //自己的id
const showId = ref('') //聊天对象id

const box = ref('') //夫盒子dom
const text = ref('') //输入框内容
const list = ref([]) //聊天记录列表
const popover = ref(false)//图片展示开关
const popoverImage = ref('')//展示图片
const DomWidth = ref(0) //html宽度

userId.value = userStore.userId //用户自己的id
showId.value = userStore.uid ? userStore.uid : getUid() //聊天对象id

// 初始化获取聊天对象数据 
const init = async() => {
  const uid = userStore.uid ? userStore.uid : getUid()
  if(!uid) return router.push('/login')
  const { status } = await userStore.getUidInfo(uid)
  console.log(userStore.userObj.user_name);
  if(status !== 0){
    alert(msg)
    return router.push('/login')
  }
}
init()


//建立websockie连接
const websocket = io('http://127.0.0.1:2095/webs',{
  auth: {  
    token: getToken(),
  }
})

onMounted(() => {
  nextTick(() => {
    //建立两个用户的连接
    websocket.emit('getRedisRoomById', userId.value.toString(), showId.value.toString())
    DomWidth.value = document.documentElement.clientWidth * 1 //获取html宽度 用于判断pc还是移动
  })
})

/**
 * 递归获取聊天记录
 * @param {String} YYYY 初始年份
 * @param {String} MM 初始月份
 * @param {String} DD 初始日期
 * @param {Object} obj 递归对象
 * @param {Array} end 结束日期
 * @param {Array} arr 返回数据
 * @returns {Array} 递归结束的数据
 */
const RenameMessage = (YYYY, MM, DD, obj, end, arr) => {
  const data = obj['Arr_' + YYYY + '_' + MM + '_' + DD] //判断当天有误聊天记录 有为 [...] 无为undefined
  console.log(YYYY, MM, DD );

  if(YYYY == end[0] && MM == end[1] && DD > end[2]) return arr //时间大于截至日期返回数据
  // if(YYYY > end[0]) return arr // 年数超过 返回数据
  
  if(data != undefined) arr = [...arr, ...data] //如果当天有数据，将数据拼接起来
  /* 递增一天  如果日期长度少于两位，将日期补零 */
  DD = (Number(DD) + 1)?.length >= 2 ? (Number(DD) + 1) : String((Number(DD) + 1)).padStart(2, '0')
  /* 如果日期大于31 递增一个月，如果月期长度少于两位则补零，  */
  MM = Number(DD) > 31 ? (Number(MM) + 1)?.length >= 2 ? (Number(MM) + 1) : String((Number(MM) + 1)).padStart(2, '0') : MM
  /* 如果日期大于31 则初始化为'01' */
  DD = Number(DD) > 31 ? '01' : DD 
  /* 如果月期大于12 递增一年 */
  YYYY = Number(MM) > 12 ? String((Number(YYYY) + 1)) : YYYY
  /* 如果月期大于12 则初始化为'01' */
  MM = Number(MM) > 12 ? '01' : MM

  //返回递归
  return RenameMessage(YYYY, MM, DD, obj, end, arr)
}

//sockie连接体
websocket.on('connect', socket => {

  //连接报错打印报错信息
  websocket.on('onerr', err => {
    if(err) return alert(err)
  })

  /* 接收房间号，获取聊天记录，存储房间号，设置房间号 */
  websocket.on('creatdSocket', req => {
    if(req.status == 1) return alert('err') //报错打印信息
    console.log(req); // room房间号，date建立聊天日期，Arr?聊天记录
    const date = req?.date?.split('_') //格式最早聊天日期
    const end = dayjs().format('YYYY-MM-DD').split('-') //格式聊天截至日期
    const response = RenameMessage(date[0], date[1], date[2], req, end, []) //递归获取聊天记录
    list.value = [...response]
    // 将试图滚动到最后一条消息
    nextTick(() => {
      box.value?.scrollTo({
        top: box.value?.scrollHeight,
        behavior: "smooth"
      })
    })  
    // console.log(list.value);
    roomId.value = req.room //报错房间号
    /* 设置聊天房间，发送的消息都会发送到room房间号，将消息提示设置为零 */
    websocket.emit('setRoom', req.room, userId.value, showId.value) 
  })
  
  // console.log(websocket.io.engine.id);
  // 发送信息后，存储成功的回显数据
  websocket.on('message', req => {
    const { uid, msg, sid, type } = req // room房间号， uid是谁发送的，sid是谁接受的，msg回显信息
    console.log(req);
    list.value.push({ uid, center: msg, sid, date: new Date().getDate(), type }) //将回显信息与获取的聊天记录拼接
    // console.log(msg);
    // 将试图滚动到最后一条消息
    nextTick(() => {
      box.value?.scrollTo({
        top: box.value?.scrollHeight,
        behavior: "smooth"
      })
    })  
  })

})

/**
 * 点击svg图标触发上传图片事件
 */
const uploadFile = () => {
    file.click()
}

/**
 * 获取图片路径
 * @param {String} img 图片路径
 */
const changeImage = (img) => {
  popoverImage.value = img
  popover.value = true
}

/**
 * 发送对象 
 */
const onFile = async () => {

  const upload = document.querySelector('#file') //获取隐藏的file选择器
  const file = upload.files[0] //拿到选中的文件

  const formdata = new FormData() 
  formdata.append('file', file) //将文件转为formdata类型

  formdata.forEach(e => { //遍历拿到的文件打印信息
    console.log(e);
  })
  const res = await axios.post('http://127.0.0.1:2095/upload/image', formdata) //上传图片拿到路径
  console.log(res.data.path); //路径

  text.value = res.data.path //将路径保存到输入框
  onInputRequest('image') //发送image 类型的聊天消息
}

/**
 * 发送消息到后端
 * @param { 'text' | 'image' } type 消息类型
 */
const onInputRequest = (type) => {

  //未输入直接返回
  if(text.value.trim() == '') return

  /* sendMessageRoom 将信息发送到对应房间号, text是发送的文本信息， roomId是房间号，userId是发送用户id, showId是接收用户id */
  websocket.emit('sendMessageRoom', text.value, roomId.value, userId.value.toString(), showId.value.toString(), type)

  //发送后清空input
  text.value = ''
}
</script>

<style>
  .avatar{
    margin-right: 10px;
  }

  .popover{
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .7);
    position: absolute;
    display: flex;
    align-items: center;
  }
  .popover img{
    /* width: auto; */
    /* max-height: 500px; */
    /* max-width: 300px; */
    width: 80%;
    margin: 0 auto;
  }

  .title{
    width: 100%;
    display: flex;
    align-items: center;
    height: 50px;
    background-color: #dfdede;
    color: orange;
    flex-direction: column;
    line-height: 50px;
    /* border: solid 2px pink;  */
    box-sizing: 2px;
    margin-bottom: 5px;
  }
  .about {
    /* width: 375px; */
    height: 100vh;
    margin: 0 auto;
    display: flex;
    align-items: center;
    padding: 20px 0;
    flex-direction: column;
    padding-top: 0;
  }
  .center{
    background-color: #f5f5f5;
    /* border: solid 2px pink; */
    box-sizing: border-box;
    min-height: 80%;
    width: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 10px 5px 10px 10px;
  }

  .center::-webkit-scrollbar {
    /* display: none; /* Chrome Safari  */
    width: 10px;
  }

  .center::-webkit-scrollbar-thumb {
    /* display: none; /* Chrome Safari  */
    height: 5px;
    background-color: #c4c1c0;
    border-radius: 5px;
  }

  .submit{
    width: 100%;
    display: flex;
    height: 15%;
  }
  .files{
    display: flex;
    flex-direction: row-reverse;
    padding: 5px 10px;
  }

  #file{
    display: none;
  }
  
  #txt{
    height: 100%;
    flex: 1;
    background-color: #dfdede;
    border: none;
    box-sizing: border-box;
    padding: 10px;
    outline: none;
  }
  .msg{
    display: flex;
    margin-bottom: 10px;
  }
  .msg img{
     width: 40px;
     height: 30px;
     object-fit: cover;
  }
  .left img{
    margin-right: 10px;
  }

  .left{
    padding-right: 15px;
  }

  .rigth{
    padding-left: 15px;
  }

  .rigth img{
    margin-left: 10px;
  }
  .msg > .cenbox{
    background-color: #FFF;
    color: orange;
    flex: 1;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }
  .rigth > div{
    justify-content: flex-end;
  }
 .image img{
    /* width: 255px;
    height: 120px; */
    width: 100%;
    height: auto;
    object-fit: cover;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .cenbox > div{
    /* width: 320px; */
    height: auto;
    word-break: break-all;
  }
  .but {
   width: 80px;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
  }
  .send{
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .send button{
    width: 60px;
    padding: 5px;
    /* border: 1px solid #fcd3d3; */
    border: none;
    border-radius: 5px;
    color: orange;
    background-color: #e9e9e9;
    transition: .3s;
  }

  .send button:hover{
    background-color: #d2d2d2;
  }
</style>
