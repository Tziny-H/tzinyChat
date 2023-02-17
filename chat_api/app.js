const express = require('express') //服务框架
const app = express() //服务实例
const cors = require('cors') //解决跨域
const dayjs = require('dayjs') //时间格式化库
const joi = require("joi") //加密库
const path = require('path') // 路径库 node自带
const redis = require('redis') //redis 
const client = redis.createClient() //redis实例
app.use(cors()) //注册跨域
const bodyParser = require('body-parser') //解析前端json数据库
app.use(bodyParser.urlencoded({ extended: false })) //判断请求体是不是json，不是的话转为对象
app.use(bodyParser.json()) //配置解析数据

//权限验证
app.use((req, res, next) => {
    res.cc = function(err, status = 1) {
        res.send({
            status,
            msg: err instanceof Error ? err.message : err
        })
    }
    next()
})

// token认证
const { expressjwt:expressJWT } = require('express-jwt')
// token配置
const config = require('./config') 

// token设置,拦截
app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api/, /^\/upload/] }))

const login = require('./router/user/login')
app.use('/api', login)                          //登陆注册接口
const userGet = require('./router/user/get')
app.use('/userget', userGet)                    //获取用户信息接口
const reqFile = require('./router/File/file')
app.use('/upload', reqFile)                     //上传图片获取图片接口

// token过期返回
app.use((err, req, res, next) => {

    if (err instanceof joi.ValidationError) return res.cc(err)

    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')

    res.cc(err)
})

const db = require('./db/index') //mysql
const server = require('http').createServer(app) 
const { Server } = require('socket.io')

// 创建socket
const io = new Server(server, {
    cors: {
        methods: ["GET", "POST"]
    }
})

//导入方法
const { getUserList, resultsSendSqlMessage, MySqlSetMessage, redisSetMessage, MessageNum, mysqlMessageNum } = require('./js/sockit_Io')

//设置socket路径
const sockie = io.of('/userlist')  //用户列表页
sockie.on('connection', socket => { 
    socket.on('setRoomById', async id => { 
        socket.join(id) //设置连接用户
        // console.log(socket.rooms); //连接列表
        const data = await getUserList(id) //获取用户列表信息 以及消息列表信息
        // console.log(data);
        socket.emit('getUserList', data, 0) //返回 用户列表信息 以及消息列表信息
    })
})

//设置socket路径
const sockets = io.of('/webshome') //用户聊天页
sockets.on('connection', socket => {

    const redisDate = dayjs().format('YYYY-MM-DD').replace(/-/g, '_') //当天的时间

    //console.log(socket.handshake.auth);// 请求头参数
    // console.log(io.engine.clientsCount); //打印连接人数
    // console.log(io.in('room-1').disconnectSockets());//断开房间内的socket
    // sockets.in(room).emit() 响应对应room的链接
    // io.emit('对应方法', '参数') 全部消息
    // socket.broadcast() 除自己
   
    /* 设置房间号 打印连接信息 */
    socket.on('setRoom', (room, uid, sid) => {

        // console.log(socket.rooms.size); // 链接信息
        // console.log(socket.rooms); //连接列表

        const { token } = socket.handshake.auth // token
        socket.join(room) //设置房间号 
    })
   
    /* 获取两个用户之间的聊天记录， 是否建立连接， 连接的房间号 id自己的id uid聊天对象的id */
    socket.on('getRedisRoomById', (id, uid) => {
        if(!id) return socket.emit('onerr', '当前网络不佳，请刷新')                  //没有id返回异常
        if(!uid) return socket.emit('onerr', '当前网络不佳，请刷新')                 //没有id返回异常
        mysqlMessageNum(id, uid)                                                    //更新用户信息列表
        const redisBid = id + '-' + uid                                             //以当前用户id开头的房间
        const redisBids = uid + '-' + id                                            //以连接用户id开头的房间 
        const initObj = { room: redisBid, date: redisDate }                         //建立连接默认值
        initObj['Arr' + '_' + redisDate] = []                                       //当天的聊天记录
        const sql = `SELECT * FROM char_message WHERE room = ? ORDER BY date ASC`   //获取当前房间号的聊天信息
        client.get(redisBid, (err, data) => {                                       //获取redis中的聊天信息
            if(err) return socket.emit('creatdSocket', { status: 1, msg: err })     //报错返回报错信息
            if(data == null){                                                       //当前房间号没有聊天信息
                client.get(redisBids, (err, res) => {                               //交互id顺序 继续获取redis中的聊天信息
                    if(err) return socket.emit('creatdSocket', { status: 1, msg: err }) //报错返回报错信息
                    if(res == null){                                                //当前房间号没有聊天信息
                        db.query(sql, redisBid, (err, results) => {                 //获取数据库中的聊天信息
                            if(err) console.log(err);
                            if(err) return socket.emit('creatdSocket', { status: 1, msg: err }) //报错返回报错信息
                            if(results.length < 1){                                 //当前房间号没有聊天信息
                                db.query(sql, redisBids, (err, response) => {       //交互id顺序 继续获取数据库中的聊天信息
                                    if(err) console.log(err);
                                    if(err) return socket.emit('creatdSocket', { status: 1, msg: err }) //报错返回报错信息
                                    if(response.length < 1){                        //当前房间号没有聊天信息
                                                                                    //初始化聊天房间
                                        client.set(redisBid, JSON.stringify(initObj), (err, info) => {
                                            if(err) console.log(err);
                                            if(err) return socket.emit('creatdSocket', { status: 1, msg: err }) //报错返回报错信息
                                            if(info == 'OK') return socket.emit('creatdSocket', initObj)  //返回房间信息
                                        })
                                    }else{
                                        // console.log(response);
                                        const MYSQL_MESSAGE_SEND = resultsSendSqlMessage(response) //格式化数据库中的聊天信息
                                        // console.log(MYSQL_MESSAGE_SEND);
                                        return socket.emit('creatdSocket', MYSQL_MESSAGE_SEND) //返回房间中的聊天信息
                                    }
                                })
                            }else{
                                // console.log(results);
                               const MYSQL_MESSAGE_SEND = resultsSendSqlMessage(results) //格式化数据库中的聊天信息
                            //    console.log(MYSQL_MESSAGE_SEND);
                               return socket.emit('creatdSocket', MYSQL_MESSAGE_SEND) //返回房间中的聊天信息
                            }
                        })
                 
                    }else{
                        // console.log( JSON.parse(res));
                        socket.emit('creatdSocket', JSON.parse(res)) //返回房间中的聊天信息
                    }
                })
            }else{
                // console.log(JSON.parse(data));
                socket.emit('creatdSocket', JSON.parse(data)) //返回房间中的聊天信息
            }
        })
    })

    // 收到全部消息 返回给对应房间号
    // uid自己的id sid对方的id room房间号 msg消息
    socket.on('sendMessageRoom', async(msg, room, uid, sid, type) => {
             
        console.log('消息', msg, room, uid, sid, type);

        if(!!room) console.log('房间号', room); //合法房间号打印房间号
        if(!!uid) console.log('发送者id', uid); //合法id打印id

        const redisMsg = await redisSetMessage(msg, room, uid, sid, type) //存入redis
        const mysqlMsg = await MySqlSetMessage(msg, room, uid, sid, type) //存入mysql
        const sidMessageMsg = await MessageNum(type, uid, sid, msg)       //更新对方消息列表
        const uidMessageMsg = await MessageNum(type, sid, uid, msg, true) //更新自己消息列表
        const data = await getUserList(sid)                               //重新获取用户列表，消息列表

        sockie.in(sid).emit('getUserList', data, 1)                       //返回给接收方
        console.log(redisMsg);                                            //打印存入信息
        console.log(mysqlMsg);                                            //打印存入信息
        console.log(sidMessageMsg);                                       //打印存入信息
        console.log(uidMessageMsg);                                       //打印存入信息
        sockets.in(room).emit('message', { msg, room, uid, sid, type })  //返回前端进行回显

    })
    

})



// 启动服务器
server.listen(2095, () => {
    //运行连接redis
    client.on('ready', () => { 
        console.log('aer you ready running redis http://139.159.136.252:6379');   // redis ip 端口
    })
    console.log('api serve running http://139.159.136.252:2095');                 // 服务器ip 端口
    console.log(path.join(__dirname, 'public'));                            //当前路径
})