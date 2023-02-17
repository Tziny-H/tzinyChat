const redis = require('redis') //redis 
const client = redis.createClient() //redis实例
const db = require('../db/index')
const dayjs = require('dayjs') //时间格式化库
const redisDate = dayjs().format('YYYY-MM-DD').replace(/-/g, '_') //今天的日期

/**
 * 将消息推送给对方
 * @param {String} uid 自己的id
 * @param {String} sid 对方的id
 * @param {String} msg 消息内容
 * @param {String} type 消息类型
 * @param {Boolean | null} then 判断是否存储为自己
 * @returns {Promise} { status:状态，0为成功，1为错误，response: 返回信息 }
 */
const MessageNum = function(type, uid, sid, msg, then = false){

    const sql = 'select * from user where id = ?' //查询sql
    msg = type == 'text' ? msg : '[图片]' // 判断消息类型 如果图片路径改为图片

    return new Promise((resolve, reject) => {
        db.query(sql, sid, (err, results) => {

            if(err) return resolve({ status: 1, response: err}) //报错返回
            console.log(uid, sid, msg, then); 

            const message_arr = JSON.parse(results[0].message_arr) //消息列表

            //修改消息列表
            if(message_arr.findIndex(e => e.id == uid) == -1){
                message_arr.push({
                    id: uid,
                    num: then ? 0 : 1,
                    msg
                })
            }else {
                message_arr.forEach(e => {
                    if(e.id == uid){
                        then ? e.num = e.num : e.num += 1
                        e.msg = msg
                    }
                })
            }

            const sql = 'update user set message_arr = ? where id =?' //存储消息列表
            const arr = JSON.stringify(message_arr) //转json
            // console.log(typeof arr);
        
            db.query(sql, [arr, sid], (err, resultsObj) => {

                if(err) return resolve({ status: 1, response: err}) //报错返回

                if(resultsObj.affectedRows !== 1) return resolve({ status: 1, response: '消息提示有误'})

                resolve({ status: 0, response: '已推送消息'})

            })
        })
    })
}

/**
 * 将聊天信息存入redis
 * @author Dawn <tziny@qq.com>
 * @param {string} msg 消息内容
 * @param {string} room 房间号
 * @param {string} uid 用户自己的id
 * @param {string} sid 聊天对象的id
 * @param {string} type 聊天类别
 * @returns {Promise} { status:状态，0为成功，1为错误，2为异常，response: 返回信息 }
 */
const redisSetMessage = function(msg, room, uid, sid, type) {

    return new Promise((resolve, reject) => {
        //获取房间号信息
        client.get(room, (err, data) => {

            if(err) console.log(err);
            if(err) return resolve({ status: 1, response: err }); //返回报错信息

            const msgObj = { uid, center: msg, type, sid, date: new Date().getDate(), room } //消息内容
            const redisData = data ? JSON.parse(data) : null //是否有聊天信息

            if(data == null) { //没有聊天信息从mysql中获取
                const sql = `SELECT * FROM char_message WHERE room = ? ORDER BY date ASC` //获取当前房间号所有聊天信息进行排序
                db.query(sql, room, (err, results) => {

                    if(err) console.log(err);
                    if(err) return resolve({ status: 1, response: err });//返回报错信息

                    if(results.length < 1){ //mysql中没有聊天信息 (redisDate 今天日期)
                        const setObj = { room, date: redisDate } //设置初始聊天日期
                        setObj['Arr' + '_' + redisDate] = [] //初始化单天聊天信息
                        setObj['Arr' + '_' + redisDate]?.push(msgObj) //将聊天信息存入
                        client.set(room, JSON.stringify(setObj), (err, res) => { //存入redis
                            if(err) console.log(err);
                            if(err) return resolve({ status: 1, response: err }); //返回报错
                            if(res == 'OK') return resolve({ status: 0, response: '消息存入成功' }); //成功返回信息
                        })
                    }else { //mysql中有聊天信息
                        const mysqlMsg = resultsSendSqlMessage(results) //将聊天信息格式化
                        //判断单天聊天信息是否存在 不存在就初始化
                        mysqlMsg['Arr' + '_' + redisDate] = mysqlMsg['Arr' + '_' + redisDate] ? mysqlMsg['Arr' + '_' + redisDate] : [] 
                        mysqlMsg['Arr' + '_' + redisDate]?.push(msgObj) //添加聊天信息
                        // console.log(mysqlMsg);
                        client.set(room, JSON.stringify(mysqlMsg), (err, res) => { //存入redis
                            if(err) console.log(err);
                            if(err) return resolve({ status: 1, response: err }); //返回报错
                            if(res == 'OK') return resolve({ status: 0, response: '消息存入成功' }); //成功返回信息
                        })
                    }
                })
            } else{ // redis中有聊天信息
                if(redisData['Arr' + '_' + redisDate] !== undefined){//判断当天聊天信息是否存在 如果有
                    redisData['Arr' + '_' + redisDate]?.push(msgObj) //存储聊天信息
                    client.set(room, JSON.stringify(redisData), (err, res) => { //存入redis
                        if(err) console.log(err);
                        if(err) return resolve({ status: 1, response: err }); //返回报错
                        if(res == 'OK') return resolve({ status: 0, response: '消息存入成功' }); //成功返回信息
                    })
                }else{ //如果没有当天聊天信息 
                    redisData['Arr' + '_' + redisDate] = [] //初始化聊天信息
                    redisData['Arr' + '_' + redisDate]?.push(msgObj) //存储聊天信息
                    client.set(room, JSON.stringify(redisData), (err, res) => { //存入redis
                        if(err) console.log(err);
                        if(err) return resolve({ status: 1, response: err }); //返回报错
                        if(res == 'OK') return resolve({ status: 0, response: '消息存入成功' }); //成功返回信息
                    })
                }
            }
        })
    })
}

/**
 * 将聊天信息存入 mysql
 * @author Dawn <tziny@qq.com>
 * @param {string} msg 消息内容
 * @param {string} room 房间号
 * @param {string} uid 自己的id
 * @param {string} sid 聊天对象id
 * @param {string} type 消息类型
 * @returns {Promise} { status:状态，0为成功，1为错误，response: 返回信息 }
 */
const MySqlSetMessage = function(msg, room, uid, sid, type){
    
    const date = dayjs().format('YYYY-MM-DD HH:mm:ss') //当天时间
    const sql = 'insert into char_message set ?' //存储消息sql
    const sqlObj = { room, uid, sid, date, center: msg, type } //数据库字段

    return new Promise((resolve, reject) => {
        db.query(sql, sqlObj, (err, results) => { //存入消息入数据库

            if(err) console.log(err);
            if(err) return resolve({ status: 1, response: err }) //返回报错信息
            if(results.affectedRows == 1) return resolve({ status: 0, response: 'mysql存入成功' }) //成功返回信息

        })
    })
    
}
/**
 * 数据库中的聊天记录格式化
 * @author Dawn <tziny@qq.com>
 * @param {Array} results 要格式化的数据
 * @returns {Object} 格式化好的数据 { room: 房间号，date: 最早聊天记录，Arr[date]: 某天的聊天记录 }
 */
const resultsSendSqlMessage = function(results){
    const resultsObj = {} //创建一个初始化对象
    if(results instanceof Array){ // 是否可以遍历的数组
        resultsObj.room = results[0]?.room //设置聊天房间号
        resultsObj.date = dayjs(results[0]?.date).format('YYYY-MM-DD').replace(/-/g, '_') //获取最初的消息日期，设置为起始聊天日期
        results?.forEach(item => {
            const resDate = dayjs(item.date).format('YYYY-MM-DD').replace(/-/g, '_') //获取每条消息日期 
            if(resultsObj['Arr' + '_' + resDate] == undefined){ //判断消息日期是否存在
                resultsObj['Arr' + '_' + resDate] = [] //不存在初始化
                resultsObj['Arr' + '_' + resDate]?.push(item) //存入消息
            }else{
                resultsObj['Arr' + '_' + resDate]?.push(item)//存入消息
            }
        })
    }
    return resultsObj // 返回格式好的数据
}

/**
 * 获取除自己以为的所有用户
 * @author Dawn <tziny@qq.com>
 * @param {String} id 用户id 
 * @returns {Promise} { status:状态，0为成功，1为错误，2为异常，response: 返回信息 }
 */
const getUserList = function(id) {

    const sql = 'select * from user' //查询所有用户

    return new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {

            const data = JSON.parse(JSON.stringify(results)) //转为对象
            
            if(err) console.log(err); 
            if(err) return resolve({ status: 1, response: err }) //报错返回信息
            
            const arr = data.filter(e => { // 返回除自己的用户
                return e.id != id
            })

            const idMessage = [] //当前用户

            // if(data.findIndex(e => e.id == id) !== -1)

            idMessage.push( //获取当前用户信息
                data.find(e => {
                    return e.id == id
                })
            )

            if(arr.length < 1) return resolve({ status: 0, response: arr }) //如果只有自己的信息，直接返回
            
            //删除重要信息
            arr.forEach(e => {
                delete e.message_arr
                delete e.user_password
            })

            //判断有没有消息列表 有的话返回消息列表 没有返回空数组
            const message_arr = idMessage.length == 1 ? JSON.parse(idMessage[0]?.message_arr) : [] 

            resolve({ status: 0, response: arr, message: message_arr  }) //返回信息
        })
    })
}
/**
 * 更新用户为收到的信息
 * @author Dawn <tziny@qq.com>
 * @param {String} id 用户id 
 * @param {string} uid 对方的id
 */
const mysqlMessageNum = function(id, uid) {

    const sql = 'select * from user where id = ?' //获取当前用户

    db.query(sql, id, (err, results) => {

        if(err) return console.log(err); //报错返回报错信息

        if(results.length != 1) return console.log('用户有误'); //没有找到当前用户返回异常

        const messageArr = JSON.parse(results[0]?.message_arr) //当前用户信息

        messageArr.forEach(e => { //判断是否存入直接的消息列表 是的话存入0 否则存入数量
            e.num = e.id == uid ? 0 : e.num
        })

        const sql = 'update user set message_arr = ? where id =?' //设置用户消息列表
        const arr = JSON.stringify(messageArr) //转为json
  
        db.query(sql, [arr, id], (err, resultsObj) => {

            if(err) return console.log(err); //报错打印报错信息

            if(resultsObj.affectedRows != 1) return console.log('更新用户聊天对象总数有误'); 
            
            console.log('用户聊天信息统计更新成功'); 
        })
    })

} 

module.exports = {
    mysqlMessageNum,
    getUserList,
    resultsSendSqlMessage,
    MySqlSetMessage,
    redisSetMessage, 
    MessageNum
}
