const express = require('express')
const router = express.Router()
const get = require('../../router_viwe/user_viwe/getView')

// 获取用户信息
router.get('/info', get.getUserIofo)
router.get('/info/:uid', get.getUidIofo)

module.exports = router