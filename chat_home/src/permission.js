import router from "./router";
import useUserStore from "./stores/modules/user";
import { getToken, removeToken } from "./utlis/cookie";


const toRouter = ['/login', '/register']

router.beforeEach((to, from, next) => {
    // console.log(getToken());
    const userStore = useUserStore() 
    if(getToken()){ //判断有无token
        if(to.path == '/login'){ //登陆页直接放行
            next()
        } else{
            if(userStore.userId === ''){ //判断有没有用户信息
                //重新获取用户信息
                userStore.getUserInfo().then(res => {
                    // console.log(res.status);

                    if(res.status !== 0) {
                        alert(res.msg)
                        removeToken()
                        return next('/login')
                    }
                   
                    next()
                })
            }else {
                // next('/login')
                next()
            }
        }
    } else{ //判断路由是否开放
        if(toRouter.indexOf(to.path) !== -1){
            next()
        } else{ //不符合跳转登页
            next('/login')
        }
    }
})