import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import req from '../utils/request'
import * as urls from '../constant/apis'


// const mobile    = '18969940931'
const appid     = 'wx92eeddb23714a9c4'

const APP_SERVER         = 'https://gateway.community-sit.easyj.top/'
// const API_SERVER         = 'https://gateway.community-dev.easyj.top/user-center/'
const API_SERVER         = 'https://gateway.community-sit.easyj.top/user-center/'




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
const URL_LIST_EQU       = API_SERVER + '/mobile/assets/outsider/getEquipmentList'
const URL_EQU_BIND       = API_SERVER + '/mobile/assets/outsider/saveEquipment'
const URL_EQU_UPDATE     = API_SERVER + '/mobile/assets/outsider/updateEquipment'


const URL_GET_PHONE      = `${APP_SERVER}/external-service/feign/wechat/mini/user/phoneNumber`
const URL_SWITCH_USER    = APP_SERVER + 'user-center/switch/school'

const jstoken=(e,mobile) =>{ return `${APP_SERVER}${URL_PARAMS}appId=${appid}&mobile=${mobile}&code=${e}` }
const aptoken=(i,j,k) =>{ return `${APP_SERVER}${URL_PARAMS}orgId=${i}&userId=${j}&userType=${k}` }


const empty = {dataSource:[]}
const check = (r,c)=>{
  if (r.data.code===0) {
    console.log(r)
    return r.data.data
  }else{
    Taro.atMessage({ "message": `${r.data.msg}`, "type": "error" })
    return empty
  }
}
const checkP = (r,c)=>{
  if (r.data.code===0) {
    return r.data
  }else{
    Taro.atMessage({ "message": `${r.data.msg}`, "type": "error" })
    return empty
  }
}

class mainStore {

  token = null;
  userList = [];
  scanRid = null;
  scanOid = null;
  scanTo  = null;
  role  = { emp: {sel: true, id: 0}, out: { sel:false , id: 0} }

  getToken = ( ) =>{ return this.token }
  getUser  = ( ) =>{ return this.userList }
  getRole  = ( ) =>{ return this.role }
  setRole  = (r) =>{ this.role = r}
  setScanRid= (r) =>{ this.scanRid = r }
  getScanRid= (r) =>{ return this.scanRid }
  setScanOid= (r) =>{ this.scanOid = r }
  getScanOid= (r) =>{ return this.scanOid }
  setScanTo = (r) =>{ this.scanTo = r }
  getScanTo = (r) =>{ return this.scanTo }


  getCurUser = () =>{
    if (this.userList.length === 0 ) return null

    if (this.role.emp.sel) {
      let id = this.role.emp.id
      return this.userList.emp[id]
    }else{
      let id = this.role.out.id
      return this.userList.out[id]
    }
  }

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

  getPhone = async(code,enc,iv) =>{
    let params = {
      code: code,
      iv: iv,
      appId: appid,
      encryptedData: enc
    }

    console.log(params)
    let r = await req.post(URL_GET_PHONE,params,this.token)
    return checkP(r,109)
  }


  init = async(mobile) => {
    let code   = await this.weLogin()
    let ret    = await req.get(jstoken(code,mobile))
    this.token = this.initToken(ret.data.data)
    let r = await req.get(URL_SWITCH_USER,'',this.token)
    let list = check(r,100)
    console.log(list)

    let u = { emp:[], out:[], role: null }

    list.map((item,i)=>{
      switch(item.userType) {
        case 'employee': u.emp.push(item);break;
        case 'outsider': u.out.push(item);break;
      }
    })

    if ((u.emp.length>0)&&(u.out.length>0)&&(this.scanTo==='out')) {
      u.role = 'out'
      this.role.out.sel = true
      this.role.emp.sel = false
    }else if ((u.emp.length>0)&&(u.out.length>0)&&(this.scanTo==='emp')) {
      u.role = 'emp'
    }else if ((u.emp.length>0)&&(u.out.length>0)&&(this.scanTo===null)) {
      u.role = 'emp'
    }else if ((u.emp.length>0)&&(u.out.length==0)&&(this.scanTo==='emp')) {
      u.role = 'emp'
    }else if ((u.emp.length>0)&&(u.out.length==0)&&(this.scanTo===null)) {
      u.role = 'emp'
    }else if ((u.emp.length>0)&&(u.out.length==0)&&(this.scanTo==='out')) {
      u.role = 'error'
    }else if ((u.emp.length==0)&&(u.out.length>0)&&(this.scanTo==='emp')) {
      u.role = 'error'
    }else if ((u.emp.length==0)&&(u.out.length>0)&&(this.scanTo==='out')) {
      u.role = 'out'
      this.role.out.sel = true
      this.role.emp.sel = false
    }else if ((u.emp.length==0)&&(u.out.length>0)&&(this.scanTo===null)) {
      u.role = 'out'
      this.role.out.sel = true
      this.role.emp.sel = false
    }


    // if ((u.role =='both')&&(this.scanTo=='out')) {
    //   this.role.out.sel = true
    //   this.role.emp.sel = false
    // }else if ((u.role =='emp')&&(this.scanTo=='out')) {
    //   u.role = 'error'
    // }else if((u.role =='out')&&(this.scanTo=='out')) {
    //   this.role.out.sel = true
    //   this.role.emp.sel = false
    // }else if((u.role =='out')&&(this.scanTo=='emp')) {
    //   u.role = 'error'
    // }

    // console.log(this.role)


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
  }

  listRes = async (params) =>{
    let r = await req.get(URL_FIND_RES,params,this.token)
    return check(r,102)
  }

  loadHsAddr = async (params) =>{
    let r = await req.get(URL_LOAD_USER_ADDR,null,this.token)
    return check(r,103)
  }


  addrUpdate =async(params)=>{
    let r = await req.post(URL_ADDR_UPDATE,params,this.token)
    return check(r,104)
  }
  
  addrBind =async(params)=>{
    let r = await req.post(URL_ADDR_BIND,params,this.token)
    return check(r,105)
  }


  loadResAddr = async (params) =>{
    let r = await req.get(URL_LOAD_RES_ADDR,params,this.token)
    return check(r,106)
  }


  saveConnInfo =async(params)=>{
    let r = await req.post(URL_SAVE_CONN_INFO,params,this.token)
    return check(r,107)
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

  listEqu = async (params) => {
    let r = await req.get(URL_LIST_EQU,params,this.token)
    return check(r,204)
  }

  // 绑定资源
  equBind = async (params) =>{
    let r = await req.post(URL_EQU_BIND,params,this.token)
    console.log(r)
    return checkP(r,205)
  }

  // 更新资源
  equUpdate = async (params) =>{
    console.log(params)
    let r = await req.post(URL_EQU_UPDATE,params,this.token)
    return checkP(r,206)
  }



  /* --- 本地缓存接口    --- */
  loadPhone =()=> {
    try {
      var value = Taro.getStorageSync('BLE_USER_PHONE')
      if (value) {
        return value
      }
    } catch (e) {
      console.log('获取本地手机失败')
    }
  }

  savePhone = (v) =>{
    try {
      Taro.setStorageSync('BLE_USER_PHONE', v)
      console.log('save',v)
    } catch (e) { 
      console.log('保存本地手机失败')
    }
  }

}


export default new mainStore()

