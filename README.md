# 使用node+express+socket.io搭建的移动端聊天小平台

#### 介绍
后端使用 express + sockte.io + mysql +redis 搭建

前端使用 vue3 搭建

实现了用户对用户之间1 对 1聊天的功能

目前功能只能发送文本，图片 算是一个空客架构 得可以加以改进

前端页面写的比较随便 使用的话建议进行优化

上线地址：http://www.tziny.xyz:11040

#### 软件架构
软件架构说明


#### 安装教程

1.  项目依赖已经携带可以直接运行
2.  项目需要电脑安装node环境 （我的版本14.18.1）
3.  项目需要电脑安装redis环境 （我的版本3.2.1）
4.  项目需要电脑安装mysql环境 （我的版本8.0以上）

#### 使用说明
##### 需要添加信息
1.  chat_api/db/index.js里的 root 密码 数据库
2.  chat_api/email/nodemailer.js里的  auth 参考 https://blog.csdn.net/weixin_48936527/article/details/122121085
3.  chat_api/router_viwe/user_viwe里42行的 mail 参考 https://blog.csdn.net/weixin_48936527/article/details/122121085
4.  chat_api/config.js里的 token加密密钥 jwtSecretKey
5.  chat_home/src/views/Register.vue 里47行的 avatarList 注册随机头像


#### 参与贡献

1.  邮箱发送验证码 https://blog.csdn.net/weixin_48936527/article/details/122121085
2.  sockte.io教学 https://www.bilibili.com/video/BV1iF411F76n/?spm_id_from=333.999.0.0&vd_source=8995819ff3af73ef29a5a90a7be7a1f2
3.  socket.io教学 https://www.bilibili.com/video/BV1qA411w7Vj/?spm_id_from=333.337.search-card.all.click&vd_source=8995819ff3af73ef29a5a90a7be7a1f2
4.  redis教程 https://www.bilibili.com/video/BV1Dh4116794/?spm_id_from=333.337.search-card.all.click&vd_source=8995819ff3af73ef29a5a90a7be7a1f2


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
