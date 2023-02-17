// 邮箱验证
const nodemailer = require("nodemailer");
// 创建smtp服务器 —— 邮箱验证
const config = {
  host: "smtp.qq.com",//邮箱服务的主机
  port: 465,//对应的端口号
  secureConnection: true,
  service: "qq",
  auth: {
    user: "",//发件人邮箱账号
    pass: "",//邮箱的授权码
  },
};
// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);
// 发送邮件
module.exports = function (mail) {
  transporter.sendMail(mail, (err, info) => {
    if (err) return console.log(err);
  });
};

