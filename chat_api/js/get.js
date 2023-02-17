const db = require('../db/index') 
/**
 * @param {*} id //用户id
 * @param {*} table //要查询的表
 * @param {*} field //匹配的字段
 * @returns { Promise: 查询数量 } 
 */
exports.getTableFieldNum = (id, table, field) => {

    const sql = `select * from ${ table } where ${ field } = ?` //查询sql
    
    return new Promise((resolve, reject) => { //返回Promise对象

        db.query(sql, id, (err, results) => { 

            if(err) return resolve(new Error(err)) //报错返回报错信息
    
            // console.log(results);
            // if(results.length !== 1) return resolve(new Error('获取用户留言数量失败') )

            return resolve(results.length) //返回查询长度
        })
        
    })

}