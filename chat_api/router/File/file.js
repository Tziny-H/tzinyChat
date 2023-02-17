const experss = require('express')
const router = experss.Router()

const formidable = require('formidable')
const path = require('path') // 路径库 node自带
const fs = require('fs') //解析文件夹库 node自带
const crypto = require('crypto')
    
const from = new formidable.IncomingForm()
from.uploadDir = path.join(__dirname,'../../public/')

//图片访问
router.get('/img/:url', (req, res) => {

    let url = req.params.url //获取图片名

    let path = {
        root: 'public/'
    }

    res.sendFile(url, path) //返回public目录里的文件

})

//上传文件
router.post('/image', async(req, res) => {

    from.parse(req, (err, fields, files) => {
        //files 文件信息 file formdata 前端上传文件名
        console.log(files.file.originalFilename); //查看文件名 

        if(err) return res.cc(err)//报错返回信息

        let hash = crypto.createHash('md5').update(files.file.originalFilename.split('.')[0]).digest('hex'); //将图片转为hash 避免图片重复保存

        let oldPath = files.file.filepath; //图片起始路径

        let newPath = path.join(__dirname,'../../public/') + hash + '.' +files.file.originalFilename.split('.')[1]; //需要存储的路径

        fs.rename(oldPath,newPath,err=>{ //存储图片
            if(err) res.cc(err) //报错返回信息
            res.send({
                status:0,
                msg:'上传成功',
                path:'http://' + req.headers.host + '/upload/img/' + hash + '.' + files.file.originalFilename.split('.')[1] //返回前端完整路径
            })
        })
    })
})

module.exports = router