const express = require('express')
const router = express.Router()
const login = require('../../router_viwe/user_viwe/loginView')

// 注册验证码
router.post('/register/code', login.getRegisterCaptcha)

// 注册
router.post('/register', login.setUserRegister)

// 登陆
router.post('/login', login.getUserLogin)

module.exports = router