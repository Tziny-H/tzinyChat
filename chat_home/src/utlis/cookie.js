import Cookie from 'js-cookie'

/**
 * 存储token
 * @param {String} val 
 */
export function setToken(val){
    return Cookie.set('token', val)
}

/**
 * 获取token
 */
export function getToken(){
    return Cookie.get('token')
}

/**
 * 删除token
 */
export function removeToken(){
    return Cookie.remove('token')
}

/**
 * 设置聊天对象id
 * @param { String | Number } val 
 */
export function setUid(val){
    return Cookie.set('uid', val)
}

/**
 * 获取聊天对象id
 */
export function getUid(){
    return Cookie.get('uid')
}