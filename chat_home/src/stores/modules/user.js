import { defineStore } from 'pinia';
import { setToken, getToken, setUid } from "../../utlis/cookie";
import axios from 'axios'
import router from '../../router';

const useUserStore = defineStore(
    'user',
    {
        state: () => ({
            token: getToken(), //token
            userId: '', // 当前用户id
            userName: '', // 当前用户民
            avatar: '', // 当前用户头像
            userEmail: '', // 当前用户邮箱
            personalityAutograph: '', // 当前用户签名
            followNum: 0, // 当前用户关注数量
            follow: [], // 当前用户关注列表
            fansNum: 0, // 当前用户粉丝数量
            fans: [], // 当前用户粉丝列表
            uid:'', // 聊天对象id
            userObj:{} //聊天对象信息
        }),
        actions:{
            /**
             * 路由到聊天界面， 存储聊天对象id
             * @param {*} user 
             */
            onRouterById(user){
                this.uid = user.id
                setUid(user.id)
                console.log(this.userObj);
                router.push('/home')
            },
            /**
             * 登陆接口 { user_email用户登陆邮箱，user_password用户登陆密码 }
             * @param {Object} data 
             * @returns {object} { status状态码，msg消息提示} 
             */
            login(data){
                return new Promise((resolve, reject) => {
                    axios({
                        method: 'post',
                        url: 'http://127.0.0.1:2095/api/login',
                        data:data
                    }).then(res => {
                        const { status, msg, token } = res.data
                        console.log(res.data);
                        if(!!token) setToken(token)
                        this.getUserInfo()
                        return resolve({status, msg})
                    })
                })
            },

            /**
             * 获取聊天对象用户信息
             * @param {Number} uid 用户id
             * @returns {object} 用户信息
             */
            getUidInfo(uid){
                return new Promise((resolve, reject) => {
                    axios({
                        method: 'get',
                        url: `http://127.0.0.1:2095/userget/info/${uid}`,
                        headers:{
                            Authorization: getToken()
                        }
                    }).then(res => {
                      
                        if(res.data.status == 0){
                            this.uid = res.data.id
                            this.userObj = res.data
                        }

                        resolve(res.data)
                    })
                })
            },
            /**
             * 获取登陆用户信息
             * @returns {object} 用户信息
             */
            getUserInfo(){
                return new Promise((resolve, reject) => {
                    axios({
                        method: 'get',
                        url: 'http://127.0.0.1:2095/userget/info',
                        headers:{
                            Authorization: getToken() 
                        }
                    }).then(res => {

                        this.userId = res.data.id //用户id
                        this.avatar = res.data.avatar //用户头像
                        this.userEmail = res.data.email //用户邮箱
                        this.userName = res.data.name //用户名
                        this.fansNum = res.data.fans 
                        this.followNum = res.data.followNum
                        
                        resolve(res.data)
                    })
                })
            }
        }
    }
)

export default useUserStore