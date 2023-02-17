const db = require('../../db/index')
const dayjs = require('dayjs')
const { getTableFieldNum } = require('../../js/get')

/**
 * @param {*} req 
 * @param {*} res
 * @param id 用户id
 * @returns {
 *  status: 状态码， msg: 返回提示， id: 用户id 
 *  name: 用户名， email: 用户邮箱， newDate: 用户注册时间
 *  follow: 用户关注数量， fans: 用户粉丝数量
 *  message: 用户留言数量， article: 用户文章数量
 * } 
 */
exports.getUserIofo = (req, res) => {

    const { id } = req.auth //前端传入用户id

    const sql = 'select * from user where id = ?' //获取用户信息

    db.query(sql, id, async(err, results) => {

        if(err) return res.cc(err) //报错返回报错信息

        if(results.length !== 1) res.cc('获取用户信息失败，请重试') //效验用户获取是否异常

        const Message = await getTableFieldNum(id, 'message', 'uid') //获取留言数量
        
        if(Message instanceof Error) return res.cc(Message) //报错返回报错信息

        const Article = await getTableFieldNum(id, 'article', 'a_id') //获取文章数量

        if(Article instanceof Error) return res.cc(Article) //报错返回报错信息
        //返回前端数据
        res.send({
            status: 0, //状态码
            msg: '获取用户信息成功', //返回提示
            id: String(results[0].id), //用户id
            name: results[0].user_name, //用户名
            email: results[0].user_email, //用户邮箱
            newDate: results[0].newdate, //用户注册时间
            follow: JSON.parse(results[0].follow).length, //用户关注数量
            fans: JSON.parse(results[0].fans).length, //用户粉丝数量
            message: Message, //用户留言数量
            article: Article, //用户文章数量
            avatar: results[0].avatar //用户头像
        })
    })
}

/**
 * @param {*} req 
 * @param {*} res
 * @param id 用户id
 * @returns {
*  status: 状态码， msg: 返回提示， id: 用户id 
*  name: 用户名， email: 用户邮箱， newDate: 用户注册时间
*  follow: 用户关注数量， fans: 用户粉丝数量
*  message: 用户留言数量， article: 用户文章数量
* } 
*/
exports.getUidIofo = (req, res) => {

   const { uid } = req.params //前端传入用户id

   const sql = 'select * from user where id = ?' //获取用户信息

   db.query(sql, uid, async(err, results) => {

       if(err) return res.cc(err) //报错返回报错信息

       if(results.length !== 1) res.cc('获取用户信息失败，请重试') //效验用户获取是否异常

    //    console.log(results);

       const Message = await getTableFieldNum(uid, 'message', 'uid') //获取留言数量
       
       if(Message instanceof Error) return res.cc(Message) //报错返回报错信息

       const Article = await getTableFieldNum(uid, 'article', 'a_id') //获取文章数量

       if(Article instanceof Error) return res.cc(Article) //报错返回报错信息

       //返回前端数据
       res.send({
           status: 0, //状态码
           msg: '获取用户信息成功', //返回提示
           id: results[0].id, //用户id
           user_name: results[0].user_name, //用户名
           user_email: results[0].user_email, //用户邮箱
           newDate: results[0].newdate, //用户注册时间
           follow: JSON.parse(results[0].follow).length, //用户关注数量
           fans: JSON.parse(results[0].fans).length, //用户粉丝数量
           message: Message, //用户留言数量
           article: Article, //用户文章数量
           avatar: results[0].avatar //用户头像
       })
   })
}