import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import req from '../utils/request'
import * as urls from '../constant/apis'


const mobile    = '18969940931'
const appid     = 'wx92eeddb23714a9c4'
const jscode=(code) =>{ return `https://gateway.community-sit.easyj.top/auth/oauth/token?client_id=sit&client_secret=sit&grant_type=password&from=wx_app&appId=${appid}&mobile=${mobile}&code=${code}` }


const API_SERVER       = 'https://gateway.community-dev.easyj.top/user-center/'
const URL_LIST_RES_HIS = API_SERVER + '/mobile/assets/employee/findList'
const URL_FIND_RES     = API_SERVER + '/mobile/assets/employee/findPageList'
const URL_LOAD_MAC     = API_SERVER + '/mobile/assets/employee/assetsDetail'
const URL_ADDR_UPDATE  = API_SERVER + '/mobile/assets/employee/updateOne'
const URL_ADDR_BIND    = API_SERVER + '/mobile/assets/employee/saveOne'

const empty = {dataSource:[]}

class mainStore {

  token = null;

  getToken = () =>{
    return this.token
  }


  
   // 微信用户登录取 code
  weLogin = async () => {
    return new Promise ( resolve => {
      Taro.login({ 
        success: res => { resolve(res.code) },
        fail:    err => { console.log(err) }
      })
    })
  }


  init = async() => {
    let code  = await this.weLogin()
    let ret   = await req.get(jscode(code))
    let token = ret.data.data.accessToken
    this.token  = `Bearer ${token}`
    // console.log(this.token)
  }

  listResHis = async () =>{
    let r = await req.get(URL_LIST_RES_HIS,'',this.token)
    if (r.data.code===0) {
      return r.data.data
    }else{
      Taro.showToast({ title:'加载错误His', duration:1000, icon:'none'})
      return empty
    }
  }

  listRes = async (params) =>{
    let r = await req.get(URL_FIND_RES,params,this.token)
    if (r.data.code===0) {
      return r.data.data
    }else{
      Taro.showToast({ title:'加载错误Res', duration:1000, icon:'none'})
      return empty
    }
  }

  loadHsAddr = async (params) =>{
    let r = await req.get(URL_LOAD_MAC,null,this.token)
    if (r.data.code===0) {
      return r.data.data
    }else{
      Taro.showToast({ title:'加载错误Addr', duration:1000, icon:'none'})
      return empty
    }
  }


  addrUpdate =async(params)=>{
    let r = await req.post(URL_ADDR_UPDATE,params,this.token)

    if (r.data.code===0) {
      return r.data.data
    }else{
      Taro.showToast({ title:'更新错误Addr', duration:1000, icon:'none'})
      return empty
    }
  }
  
  addrBind =async(params)=>{
    let r = await req.post(URL_ADDR_BIND,params,this.token)

    console.log(r)
    if (r.data.code===0) {
      return r.data.data
    }else{
      Taro.showToast({ title:'更新错误Addr', duration:1000, icon:'none'})
      return empty
    }
  }


  // async getToken(url) {
  //   let r = await req.get(url)
  //   return r
  // }





}


export default new mainStore()

