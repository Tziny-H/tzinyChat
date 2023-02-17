const db = require('../../db/index')
const bcrypt = require('bcryptjs')
const { captcha } = require('../../js/captcha')
const send_email = require('../../email/nodemailer')
const jwt = require('jsonwebtoken')
const config = require('../../config')
const dayjs = require('dayjs')

let captchaCode = [] //用户注册验证码 { code: 验证码, email: 用户邮箱, newdate: 过期时间 }

/**
 * @param {*} req 
 * @param {*} res 
 * @param email 用户邮箱
 * @returns { status:状态码, msg:返回提示, code:验证码 }
 */
exports.getRegisterCaptcha = (req, res) => {

    const email = req.body.email //前端传入的参数

    captchaCode = captchaCode.filter(e => { //清除过期的验证码
        console.log(e.date , new Date().getTime());
        return e.date >= new Date().getTime()
    })

    if(captchaCode.findIndex(e => e.email == email) !== -1) return res.cc('已发送过验证码,有效期为1分钟,请勿重复发送')
   
    let sql = 'select * from user where user_email = ?' //查看用户sql

    db.query(sql, email, (err, results)=>{

        if(err) return res.cc(err) //报错返回报错信息

        if(results.length > 0) return res.cc('该用户已经注册 每个邮箱只能注册一个用户') //效验用户是否已注册

        let code = captcha() //获取随机验证码
        const setDate = new Date().getTime() //获取验证码有效时间

        captchaCode.push({ code, email, date: setDate + 60000 }) //存入验证码列表

        let mail = { //发送验证码信息
            from: "", //发件人
            subject:'验证码', //发送标题
            to:email,
            text:'验证码为 ' + code
        }

        send_email(mail) //发送验证码

        res.send({  //返回前端数据
            status: 0,
            mag: '发送成功',
            code
        })
    })

}

/**
 * @param {*} req 
 * @param {*} res
 * @param user { email:用户邮箱, code:验证码, password:用户密码, name: 用户名 }
 * @returns { status:状态码, msg:返回提示 }
 */
exports.setUserRegister = (req, res) =>{

    let user = req.body //前端传的参数
    console.log(user.email); //查看用户信息
    captchaCode = captchaCode.filter(e => { //清除过期的验证码
        return e.date >= new Date().getTime()
    })
  
    if(!user.code) return res.cc('请输入验证码') //效验前端传的验证码
    
    const userCode = captchaCode.find(e => { //拿到用户的验证码
        return e.email == user.email
    })

    if(!userCode) return res.cc('未获取验证码') //效验有没有验证码
    
    if(user.code !== userCode.code) return res.cc('验证码过期或错误') //效验用户验证码是否正确

    delete user.code //删除用户传入的验证码
    let root = { user_email: user.email } //sql写入用户

    let sql = 'select * from `user` where user_email = ?' //查看用户sql

    db.query(sql, root.user_email, (err,results)=>{

        if(err) return res.cc(err) //报错打印报错信息

        if(results.length > 0) return res.cc('该用户已经注册 每个邮箱只能注册一个用户') //效验用户是否已注册

        root.user_password =  bcrypt.hashSync(user.password, 10) //用户密码加密
        root.newdate =  dayjs().format('YYYY-MM-DD HH:mm:ss') //用户注册时间
        root.user_name = user.email //用户名 默认为邮箱
        root.avatar = user.avatar //用户头像

        let sql = 'insert into user set ?' //写入用户入数据库sql[]

        db.query(sql, root, (err, results)=>{

            if(err) return res.cc(err) //报错打印报错信息

            if(results.affectedRows !== 1) return res.cc('注册失败') //效验注册是否成功

            res.send({ //返回前端数据
                status: 0,
                mas: '注册成功'
            })
        })
    })

}

/**
 * @param {*} req 
 * @param {*} res 
 * @param user { email: 用户邮箱, password: 用户密码 }
 * @returns { status:状态码, msg:返回提示, token: 用户认证信息 }
 */
exports.getUserLogin = (req, res) => {

    let user = req.body //前端参数

    console.log(user); //查看用户信息

    let sql = 'select * from user where user_email = ?' //查询用户sql

    db.query(sql, user.email, (err, results) => {

        if(err) return res.cc(err) //报错打印报错信息

        if(results.length !== 1) return res.cc('登陆失败') //效验登陆是否成功

        const compareResult = bcrypt.compareSync(user.password, results[0].user_password) //效验密码是否正确

        if(!compareResult) return res.cc('密码错误') //若密码错误返回错误信息

        const users = { ...results[0], password: '' } //用户数据加密

        const token = jwt.sign(users, config.jwtSecretKey, { expiresIn: config.dataTime }) //加密组合token

        res.send({ //返回前端数据
            status: 0,
            msg: '登陆成功',
            token: 'Bearer ' + token
        })

    })
}