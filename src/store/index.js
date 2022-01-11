import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import req from '../utils/request'
import * as urls from '../constant/apis'


const mobile    = '18969940931'
const appid     = 'wx92eeddb23714a9c4'

const APP_SERVER         = 'https://gateway.community-sit.easyj.top/'
const API_SERVER         = 'https://gateway.community-dev.easyj.top/user-center/'
const URL_PARAMS         = 'auth/oauth/token?client_id=sit&client_secret=sit&grant_type=password&from=wx_app&'
const URL_LIST_RES_HIS   = API_SERVER + '/mobile/assets/employee/findList'
const URL_FIND_RES       = API_SERVER + '/mobile/assets/employee/findPageList'
const URL_LOAD_USER_ADDR = API_SERVER + '/mobile/assets/employee/assetsDetail'
const URL_ADDR_UPDATE    = API_SERVER + '/mobile/assets/employee/updateOne'
const URL_ADDR_BIND      = API_SERVER + '/mobile/assets/employee/saveOne'
const URL_LOAD_RES_ADDR  = API_SERVER + '/mobile/assets/employee/detail'
const URL_SAVE_CONN_INFO = API_SERVER + '/mobile/assets/employee/saveConnectInfo'

const URL_LIST_ORG_HIS   = API_SERVER + '/mobile/assets/outsider/findList'
const URL_LIST_ORG       = API_SERVER + '/mobile/assets/outsider/searchPageList'
const URL_LIST_CLS       = API_SERVER + '/mobile/assets/outsider/resource/searchPageList'
const URL_EQU_BIND       = API_SERVER + '/mobile/assets/outsider/saveEquipment'
const URL_EQU_UPDATE     = API_SERVER + '/mobile/assets/outsider/updateEquipment'


const URL_SWITCH_USER    = APP_SERVER + 'user-center/switch/school'

const jstoken=(e) =>{ return `${APP_SERVER}${URL_PARAMS}appId=${appid}&mobile=${mobile}&code=${e}` }
const aptoken=(i,j,k) =>{ return `${APP_SERVER}${URL_PARAMS}orgId=${i}&userId=${j}&userType=${k}` }


const empty = {dataSource:[]}
const check = (r,c)=>{
  if (r.data.code===0) {
    return r.data.data
  }else{
    console.log(r, c)
    Taro.atMessage({ "message": `${r.data.msg} ${c}`, "type": "error" })
    return empty
  }
}
const checkP = (r,c)=>{
  if (r.data.code===0) {
    return 0
  }else{
    console.log(r)
    Taro.atMessage({ "message": `${r.data.msg} ${c}`, "type": "error" })
    return empty
  }
}

class mainStore {

  token = null;
  userList = [];
  role  = { emp: {sel: true, id: 0}, out: { sel:false , id: 0} }

  getToken = ( ) =>{ return this.token }
  getUser  = ( ) =>{ return this.userList }
  getRole  = ( ) =>{ return this.role }
  setRole  = (r) =>{ this.role = r}


  initToken = (r) => { return `${r.tokenHead}${r.accessToken}` }
  
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
    let code   = await this.weLogin()
    let ret    = await req.get(jstoken(code))
    this.token = this.initToken(ret.data.data)
    let r = await req.get(URL_SWITCH_USER,'',this.token)
    let list = check(r,100)
    // console.log(list)

    let u = { emp:[], out:[], role: null }

    list.map((item,i)=>{
      switch(item.userType) {
        case 'employee': u.emp.push(item);break;
        case 'outsider': u.out.push(item);break;
      }
    })

    if ((u.emp.length>0)&&(u.out.length>0)) {
      u.role = 'both'
    }else if ((u.emp.length>0)&&(u.out.length==0)) {
      u.role = 'emp'
    }else if ((u.emp.length==0)&&(u.out.length>0)) {
      u.role = 'out'
    }
    this.userList = u

    return this.userList
  }

  switch = async(e) => {
    let url = aptoken(e.orgId,e.userId,e.userType)
    let r = await req.get(url)
    this.token = this.initToken(r.data.data)
    // console.log(this.token)
  }


  listResHis = async () =>{
    let r = await req.get(URL_LIST_RES_HIS,'',this.token)
    return check(r,101)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   Taro.showToast({ title:'加载错误His', duration:1000, icon:'none'})
    //   return empty
    // }
  }

  listRes = async (params) =>{
    let r = await req.get(URL_FIND_RES,params,this.token)
    return check(r,102)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   console.log(r.data)
    //   Taro.showToast({ title:'加载错误Res', duration:1000, icon:'none'})
    //   return empty
    // }
  }

  loadHsAddr = async (params) =>{
    let r = await req.get(URL_LOAD_USER_ADDR,null,this.token)
    return check(r,103)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   Taro.showToast({ title:'加载错误Addr', duration:1000, icon:'none'})
    //   return empty
    // }
  }


  addrUpdate =async(params)=>{
    let r = await req.post(URL_ADDR_UPDATE,params,this.token)
    return check(r,104)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   Taro.showToast({ title:'更新错误Addr', duration:1000, icon:'none'})
    //   return empty
    // }
  }
  
  addrBind =async(params)=>{
    let r = await req.post(URL_ADDR_BIND,params,this.token)
    return check(r,105)
    // console.log(r)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   Taro.showToast({ title:'更新错误Addr', duration:1000, icon:'none'})
    //   return empty
    // }
  }


  loadResAddr = async (params) =>{
    let r = await req.get(URL_LOAD_RES_ADDR,params,this.token)
    return check(r,106)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   console.log(r.data)
    //   Taro.showToast({ title:'ResAddr错误', duration:1000, icon:'none'})
    //   return empty
    // }
  }


  saveConnInfo =async(params)=>{
    let r = await req.post(URL_SAVE_CONN_INFO,params,this.token)
    return check(r,107)

    // console.log(r)
    // if (r.data.code===0) {
    //   return r.data.data
    // }else{
    //   Taro.showToast({ title:'更新错误Addr', duration:1000, icon:'none'})
    //   return empty
    // }
  }
  
  
  /* --- 维护人员接口    --- */

  //查询历史维护记录
  listOrgHis= async (params) =>{
    let r = await req.get(URL_LIST_ORG_HIS,params,this.token)

    return check(r,201)
  }

  //查询学校
  listOrg = async (params) =>{
    let r = await req.get(URL_LIST_ORG,params,this.token)
    console.log(r)
    return check(r,202)
  }

  //查询教室
  listCls = async (params) =>{
    let r = await req.get(URL_LIST_CLS,params,this.token)
    return check(r,203)
  }

  equBind = async (params) =>{
    let r = await req.post(URL_EQU_BIND,params,this.token)
    return checkP(r,204)
  }

  equUpdate = async (params) =>{
    let r = await req.post(URL_EQU_UPDATE,params,this.token)
    return checkP(r,205)
  }

  

}


export default new mainStore()

