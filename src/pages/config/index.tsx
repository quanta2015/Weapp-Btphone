import Taro from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Input, Image,Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage, AtActivityIndicator } from "taro-ui";
import {fspc, isN} from '../../utils/fn'
import SwitchRole from '../../component/switchrole' 

import './index.scss'

import icon_load    from '../../static/loading.svg'
import icon_refresh from '../../static/refresh.svg'
import icon_search  from '../../static/search.svg'
import icon_return  from '../../static/return.svg'
import icon_user    from '../../static/user.svg'
import icon_house   from '../../static/house.svg'
import icon_scan    from '../../static/scan_b.svg'
import img_info     from '../../static/info.png'
import img_none     from '../../static/none.png'
import icon_seno    from '../../static/icon_seno.svg'
import icon_switch  from '../../static/icon_switch.svg'

// 状态机定义
const STATUS_INIT = 0
const STATUS_ADDR = 1
const STATUS_CLAS = 2
const STATUS_BIND = 3
const STATUS_EDIT = 4
const STATUS_SORG = 5
const STATUS_SCLS = 6

// 资源类型
const typeNameList = ['音响板卡','广告电视']
const typeValList  = ['audio_board','tv']





@inject('store')
@observer
class Config extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      selOrg: -1,
      selCls: -1,
      selRes: -1,
      selType: 0,
      loading: false,
      showInfo: false,
      showSwitch: false,
      finishSearch: false,
      status: STATUS_INIT,
      equList: [],
      hisList: [],
      retList: [],
      orgList: [],
      e_code: null,
      e_type: null,
      e_name: null,
      e_id:   null,
      showActivity: false ,
      pageNo: 1,
      total: 0,
    }
  }

  initVar =()=> {
    this.setState({
      selOrg: -1,
      selCls: -1,
      selRes: -1,
      selType: 0,
      loading: false,
      showInfo: false,
      showSwitch: false,
      finishSearch: false,
      status: STATUS_INIT,
      equList: [],
      hisList: [],
      retList: [],
      orgList: [],
      e_code: null,
      e_type: null,
      e_name: null,
      e_id:   null,
      showActivity: false ,
      pageNo: 1,
      total: 0,
      keyword: '',
    })
  }


  initData=async()=>{
    this.initVar()
    let userName = this.store.getCurUser().userName
    this.setState({loading: true, userName:userName  })
    let r = await this.store.listOrgHis()

    console.log(r)
    this.setState({hisList: r.dataSource, loading: false})
  }


  initScan = async() => {
    let scanRid = this.store.getScanRid()
    let scanOid = this.store.getScanOid()
    let params = { orgId: scanOid, resourceId: scanRid}
    console.log('params',params)
    if (!isN(scanRid)) {
      this.setState({loading: true})
      let r = await this.store.listCls(params)


      
      console.log(r)
      this.setState({loading: false, showInfo: true, selOrgId:scanOid, selOrgName: "",selResId:scanRid, equList:r.dataSource[0].equipmentList, status: STATUS_CLAS})
    }
  } 


  async componentDidShow () { 
    await this.initData()
    await this.initScan()
  }


  // 选择资源对象
  doSel = async(e)=>{
    switch(this.state.status) {
      case STATUS_INIT: 
      case STATUS_SORG:
        this.searchCls({orgId:e.orgId, keyword:'', pageNo:1, pageSize: 20})
        this.setState({showInfo: true, selOrgId:e.orgId, selOrgName: e.name, status: STATUS_ADDR});break;
      case STATUS_ADDR:
      case STATUS_SCLS:
        console.log(e.id)
        this.setState({showInfo: true, selResId:e.id, selClsName:e.resourceName, equList: e.equipmentList, status: STATUS_CLAS});break;
    }   
  }

  // 显示绑定对话框
  doBind =()=>{
    this.setState({
      showInfo:false, 
      e_code:'', 
      e_name:'',
      e_type:typeNameList[0],
      status: STATUS_BIND
    })
  }

  // 扫码二维码
  doScan=()=>{
    let that = this
    wx.scanCode({
      success(res) { that.setState({ e_code: res.result}) }
    })
  }

  // 更新类型
  doSelType=(e)=>{
    let id = e.detail.value
    this.setState({ e_type: typeNameList[id], selType:id  })
  }
  // 更新名称
  doChgName=(e)=>{
    let val = fspc(e.target.value)
    this.setState({ e_name: val})
  }
  // 更新地址编码
  doChgCode=(e)=>{
    let val = fspc(e.target.value)
    this.setState({ e_code: val})
  }

  // 显示绑定资源
  doEdit = async(e,i)=>{
    this.setState({ 
      status: STATUS_EDIT, 
      showInfo: false, 
      e_code:e.code, 
      e_type: e.typeDesc, 
      e_name:e.name,
      e_id: e.id,
      selRes: i,
    })
  }

  // 绑定资源
  doBindItem=async()=>{
    let {equList,e_code,e_type,e_name,selType} = this.state

    if (isN(e_code)||isN(e_type)||isN(e_name)) {
      Taro.atMessage({ "message": "请输入信息", "type": "success", })
    }else{
      let params = {
        orgId: this.state.selOrgId,
        resourceId: this.state.selResId,
        code: e_code,
        type: typeValList[selType],
        name: e_name,
      }
      this.setState({loading: true})
      let r = await this.store.equBind(params)
      if (r.code===0) {
        let s = await this.store.listOrgHis()
        Taro.atMessage({ 'message':'绑定设备成功', 'type':'success' })
        equList.push(r.data)
        this.setState({ 
          loading: false,
          equList: equList,
          status: STATUS_CLAS, 
          e_code: null,
          e_type: null,
          e_name: null,
          e_id: r.data.id,
          showInfo: true,
          hisList: s.dataSource,
        })
      }else{
        this.setState({ loading: false })
      }
      
    }
  }
  
  // 更新资源
  doChgEqu=async(e,i)=>{ 
    let {e_code,e_name,e_type,selRes,selType,e_id,equList} = this.state
    let params = {
      orgId: this.state.selOrgId,
      resourceId: this.state.selResId,
      code: e_code,
      type: typeValList[selType] ,
      name: e_name,
      id: e_id,
    }
    if (isN(e_code)||isN(e_name)) {
      Taro.atMessage({ 'message':' 请输入完整的设备信息！', 'type':'error' })
    }else{
      this.setState({loading: true})
      let r = await this.store.equUpdate(params)
      if (r.code===0) {
        Taro.atMessage({ 'message':'更新设备成功', 'type':'success' })
        equList[selRes].name = e_name
        equList[selRes].code = e_code
        equList[selRes].type = typeValList[selType] 
        equList[selRes].typeDesc = e_type
        this.setState({ 
          loading: false,
          equList: equList,
          status: STATUS_CLAS, 
          e_code: null,
          e_type: null,
          e_name: null,
          showInfo: true,
        })
      }else{
        this.setState({ loading: false })
      }
    }
  }

  
  // 返回
  doReturn=()=>{
    switch(this.state.status) {
      case STATUS_ADDR: 
        this.setState({status: STATUS_INIT,retList:[], showInfo: false }); break;
      case STATUS_CLAS: 
        console.log(this.state.retList)
        this.setState({status: STATUS_ADDR, }); break;
      case STATUS_BIND: 
        this.setState({status: STATUS_CLAS,showInfo: true }); break;
      case STATUS_EDIT: 
        this.setState({status: STATUS_CLAS,showInfo: true }); break;
      case STATUS_SORG: 
        this.setState({status: STATUS_INIT, retList:[], finishSearch:false, pageNo:1 });break;
      case STATUS_SCLS:
        this.setState({status: STATUS_ADDR, retList:[], finishSearch:false, pageNo:1 });break;
    }
  }

  // 显示搜索对话框
  doShowSearch=()=>{
    if (this.state.status === STATUS_INIT)　{
      this.setState({status: STATUS_SORG, finishSearch:false})
    }else{
      this.setState({status: STATUS_SCLS, retList: [], finishSearch:false})
    }
  }

  // 搜索
  doSearch=async(e)=>{
    let keyword = fspc(e.detail.value)

    if (isN(keyword)) {
      Taro.atMessage({ 'message':' 请输入搜索关键字', 'type':'error' })
      return
    }
    let u = this.store.getUser()
    let orgId = this.store.getCurUser().orgId
    this.setState({loading: true, finishSearch:true, keyword: keyword, pageNo:1 })
    if (this.state.status === STATUS_SORG)　{
      let params = { keyword:keyword, orgId: orgId, pageSize:20, pageNo:1 }
      let r = await this.store.listOrg(params)
      console.log(r)
      let total = r.pagination.total
      let page = parseInt(total/r.pagination.pageSize)+1
      this.setState({retList: r.dataSource, loading: false, page: page, total: total})
    }else{
      let params = { keyword:keyword, orgId:this.state.selOrgId, pageNo: 1, pageSize:20 }
      this.searchCls(params)
    }
  }

  // 搜索教室
  searchCls = async(params) => {
    console.log(params)
    this.setState({loading: true})
    let r = await this.store.listCls(params)
    console.log(r)
    let total = r.pagination.total
    let page = parseInt(total/r.pagination.pageSize)+1
    this.setState({retList: r.dataSource, loading: false, page: page, total: total})
  }

  doRepair=(e)=>{ }

  doSwitch = ()=>{
    let u = this.store.getUser()
    this.setState({showSwitch: true,userlist: u })
  }

  doSelRole=async(role,params)=>{
    this.setState({showSwitch: false, loading:true})
    await this.store.switch(params)
    switch(role) {
      case 0: Taro.switchTab({url:`/pages/lesson/index`});break;
      case 1: this.initData();break;
    } 
  }

  onReachBottom = async() => {
    let {pageNo, retList, page, keyword} = this.state

    if (pageNo+1 <= page) {
      let r
      this.setState({ showActivity: true })
      let orgId = this.state.selOrgId
      let params = { keyword:keyword, orgId: orgId, pageNo:pageNo+1, pageSize: 20 }

      if (this.state.status === STATUS_SORG)　{
        r = await this.store.listOrg(params)
      }else{
        r = await this.store.listCls(params)
      }
      retList.push(...r.dataSource)
      this.setState({retList: retList, pageNo: pageNo+1,showActivity: false })
    }
  }


  render () {

    const { userName,status,showInfo,retList,equList,hisList,showSwitch,
            e_name,e_code,e_type,selOrgName,selClsName } = this.state
    const focus = (this.state.finishSearch)?false:true

    let addr 
    switch(status) {
      case STATUS_INIT: addr = '';break;
      case STATUS_ADDR: addr = (showInfo)?selOrgName:"";break;
      case STATUS_CLAS: addr = (showInfo)?selClsName:"";break;
    }


    return (
      <View className='g-config'>
        <AtMessage/>

        {(this.state.loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}

        {(showSwitch)&&<SwitchRole userlist={this.state.userlist} selRole={this.store.getRole()} onSwitch={this.doSelRole} />} 

        {((status!== STATUS_BIND)&&(status!==STATUS_EDIT))&&
        <View className="m-hd">
          <View className="m-tl" onClick={this.doSwitch}>
            <View>{userName}</View>
            <Image className="f-icon-s" src={icon_switch}></Image>
          </View>
        </View>}

        {((status=== STATUS_BIND)||(status===STATUS_EDIT))&&
        <View className="m-hd">
          <View className="m-return" onClick={this.doReturn}>
            <Image className="f-icon" src={icon_return}></Image>
          </View>
          <View className="m-user">绑定设备</View>
          <Image className="f-icon-s f-icon-user" src={icon_user}></Image>
        </View>}


        {((status=== STATUS_ADDR)||(status===STATUS_CLAS))&&
        <View className="m-info">
          <View className="m-wrap">
            <View className="m-tl">{addr}</View>
            <View className="m-chg"  onClick={this.doReturn}>
              <Text>更换</Text>
              <Image className="f-icon-s" src={icon_refresh}></Image>
            </View>
          </View>
        </View>}

        <View className="m-bd">
          {(status===STATUS_INIT)&&<View className="f-tl">快速搜索</View>}

          {((status===STATUS_INIT)||(status==STATUS_ADDR))&&
          <View className="f-search">
            <View className="f-wrap">
              <Image className="f-icon" src={icon_search}></Image>
              <View className="f-input" onClick={this.doShowSearch}>请输入名称进行搜索</View>
            </View>
          </View>}
          
          {(status===STATUS_INIT)&&<View className="f-tl">最近管理的组织</View>}

          {(status==STATUS_INIT)&&
          <View className="m-wrap">
            {hisList.map((item,i)=>
              <View className="f-res" onClick={this.doSel.bind(this,item)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.name}</View>
                  <View className="f-cls">{item.cls}</View>
                </View>
              </View>
            )}
          </View>}



          {((status===STATUS_SORG)||(status===STATUS_SCLS))&&
          <View className="m-sear">
            <View className="f-sear">
              <View className="f-wrap">
                <Image className="f-icon-s" src={icon_search}></Image>
                <Input className="f-input" 
                       placeholder="请输入名称进行搜索"  
                       onConfirm={this.doSearch}
                       confirm-type="search" focus={focus}></Input>
              </View>
              <View className="f-cancel" onClick={this.doReturn}> 取消</View>
            </View>

            {(retList.length!==0)&&
            <View className="m-count">
               搜索到 <Text>{this.state.total}</Text> 条相关内容
            </View>}
            {(retList.length!==0)&&
            <View className="m-wrap">
              {retList.map((item,i)=>
                <View className="f-res" onClick={this.doSel.bind(this,item)}>
                  <View className="f-hd">
                    <Image className="f-icon" src={icon_house}></Image>
                  </View>
                  <View className="f-bd">
                    {(status===STATUS_SORG)&& <View className="f-bud">{item.name}</View>}

                    {(status===STATUS_SCLS)&& <View className="f-bud">{item.resourceName}</View>}
                  </View>
                </View>
              )}
            </View>}

            {(retList.length===0)&&
            <View className="m-wrap">
              <View className="m-none">
                <Image src={icon_seno}></Image>
                <Text>暂无匹配记录</Text>
              </View>
            </View>}

            {(this.state.showActivity)&&
            <View className="m-end">
              <AtActivityIndicator></AtActivityIndicator>
            </View>}

            {((this.state.pageNo===this.state.page)&&(retList.length!==0))&&
              <View className="m-end"> ---- 没有更多内容啦 ----</View>}
          </View>}


          {(status==STATUS_ADDR)&&
          <View className="m-wrap">
            {retList.map((item,i)=>
              <View className="f-res" onClick={this.doSel.bind(this,item)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.resourceName}</View>
                </View>
              </View>
            )}
          </View>}


          {(status=== STATUS_CLAS)&& <View className="f-tl">关联设备</View>}


          {(status=== STATUS_CLAS)&&
          <View className="m-ret">

            {(equList.length===0)&&
            <View className="m-wrap">
              <View className="m-none">
                <Image src={img_none}></Image>
                <Text>暂无设备</Text>
              </View>
            </View>}


            {(equList.length!==0)&&
            <View className="m-wrap">
              {equList.map((item,i)=>
                <View className="m-item" onClick={this.doEdit.bind(this,item,i)}>
                  <View className="m-name">{item.name}</View>
                  <View className="m-label">{item.typeDesc}</View>
                  <View className="m-label">{item.code}</View>
                </View>
              )}
            </View>}


            <View className="m-bind" onClick={this.doBind}>
              <Text> 绑定</Text>
              <Text> 设备</Text>
            </View>
          </View>}

    
          {((status=== STATUS_BIND)||(status===STATUS_EDIT))&&
          <View className="g-bind">
            <View className="m-row">
              <View className="m-tl">设备编号</View>
              <View className="m-form">
                <Input placeholder="请输入或扫码" value={e_code} onInput={this.doChgCode} />
                <Image className="f-icon" src={icon_scan} onClick={this.doScan}></Image>
              </View>
            </View>
            <View className="m-row">
              <View className="m-tl">设备类型</View>
              <View className="m-form">
                <Picker mode='selector' range={typeNameList} onChange={this.doSelType}>
                {(this.state.e_type===null)&& <View className='picker'> 请选择：</View>}
                {(this.state.e_type!==null)&&<View className='picker'> {e_type} </View>}
              </Picker>
              </View>
            </View>
            <View className="m-row">
              <View className="m-tl">设备名称</View>
              <View className="m-form">
                <Input placeholder="请输入" onInput={this.doChgName} value={e_name}  />
              </View>
            </View>
            <View className="m-row"></View>

            {(status=== STATUS_BIND)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doBindItem}> 绑定设备</View>
            </View>}

            {(status=== STATUS_EDIT)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doChgEqu}> 更换设备</View>
              <View className="m-btn" onClick={this.doRepair}> 上报维修</View>
            </View>}

          </View>}


        </View>
      </View>
    )
  }
}

export default Config
