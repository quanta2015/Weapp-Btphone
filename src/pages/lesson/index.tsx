import { Component } from 'react'
import { View, Button, Text,Form, Input, Image, Radio } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import dayjs from 'dayjs'
import Taro,{ getCurrentInstance } from '@tarojs/taro'
import { AtMessage, AtActivityIndicator } from "taro-ui";
import {openBle,bleCommand} from '../../utils/bt'
import {fspc} from '../../utils/fn'
import Modal  from '../../utils/modal'
import SwitchRole from '../../component/switchrole' 
import './index.scss'


import icon_load    from '../../static/loading.svg'
import icon_refresh from '../../static/refresh.svg'
import icon_search  from '../../static/search.svg'
import icon_return  from '../../static/return.svg'
import icon_user    from '../../static/user.svg'
import icon_house   from '../../static/house.svg'
import icon_scan    from '../../static/scan.svg'
import icon_microg  from '../../static/microp_g.svg'
import img_none     from '../../static/none.png'
import img_lesson   from '../../static/lesson.png'
import icon_seno    from '../../static/icon_seno.svg'
import icon_switch  from '../../static/icon_switch.svg'



// 状态机定义
const STATUS_INIT   = 0
const STATUS_SEAR   = 1
const CMD_SEND_ADDR = 1
const CMD_RSET_CARD = 2

const ST_BLE_INIT  = 0
const ST_BLE_CONN  = 1
const ST_BLE_SUCC  = 2
const ST_BLE_FAIL  = 3
const ST_BLE_REST  = 4
const ST_BLE_FINN  = 5


const MSG_CONN_INIT = '确定要连接，开始上课吗？'
const MSG_CONN_ING  = '设备连接中......'
const MSG_CONN_SUCC = '设备连接成功！'
const MSG_CONN_FAIL = '设备异常，请重启设备恢复或关闭电源重启恢复'
const MSG_CONN_REST = '设备重启中......'
const MSG_CONN_FINN = '设备重启成功'


var _TIME

@inject('store')
@observer
class Lesson extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      bind:     false,
      loading:  false,
      showConn: false,
      showModal:  false,
      showSearch: false,
      showSwitch: false,
      showConfirm:  false,
      showBleconf:  false,
      finishSearch: false,
      status: STATUS_INIT,
      hisList: [],
      retList: [],
      macAddr: null,
      showActivity: false ,
      pageNo: 1,
      st_conn: 0,
      count: 5,
      connInfo: '',
    }
  }


  

  initData = async()=>{
    this.setState({loading: true })
    let s = await this.store.listResHis()
    let r = await this.store.loadHsAddr()
    let data = r.dataSource
    if (data.length>0) {
      this.setState({ hisList: s.dataSource, bind: true, macAddr:data[0].itemCode, loading: false, showActivity: false })
    }else{
      this.setState({loading: false })
    }
  }

  componentWillUnmount () {     
    clearTimeout(_TIME)
  }

  async componentDidShow() {
    this.initData()
  }


  // 显示连接板卡对话框
  doShowConn = async(id) =>{
    if (this.state.bind) { 
      let params = { resourceId:id }
      this.setState({loading: true })
      let r = await this.store.loadResAddr(params)
      let f = r.formValue

      if (f.equipmentList.length===0) {
        Taro.atMessage({ 'message': '尚未绑定板卡','type': 'error' })
        this.setState({ loading: false })
      }else{
        let addrCard = f.equipmentList[0].code
        let addrHdst = f.itemCode
        let command  = bleCommand(addrHdst,addrCard)
        let info = {
          equipmentId: f.equipmentList[0].id,
          itemId: f.itemId,
          orgId: f.orgId,
          resourceId: f.equipmentList[0].resourceId,
          message: 'success',
          status: 'success',
        }
        console.log('command:',command)
        this.setState({ 
          loading: false, 
          showConn: true, 
          connInfo:MSG_CONN_INIT, 
          cmd:command, 
          info:info 
        })
      }
    }else{
      this.setState({showModal: true})
    }
  }

  // 连接计数器
  doCounter=(e)=>{
    this.setState({count: e})
    _TIME = setInterval(() => { 
      switch(this.state.st_conn) {
        case ST_BLE_SUCC:
          this.setState({ connInfo: MSG_CONN_SUCC })
          clearTimeout(_TIME);
          break;
        case ST_BLE_CONN:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            this.setState({ st_conn: ST_BLE_FAIL,connInfo: MSG_CONN_FAIL })
          };
          break;
        case ST_BLE_FAIL:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            clearTimeout(_TIME);
          };
          break;
        case ST_BLE_REST:
          if (this.state.count>0) {
            this.setState({ count:(this.state.count-1)})
          }else{
            clearTimeout(_TIME);
            this.setState({ st_conn:ST_BLE_FINN, connInfo: MSG_CONN_FINN })
          };
          break;
      }
    }, 1000)
  }

  // 连接完成写日志
  dolog = async()=>{
    let {info} = this.state
    this.setState({ st_conn: ST_BLE_SUCC })
    let s = await this.store.saveConnInfo(info)
    console.log(s)
    Taro.atMessage({ 'message':'保存连接信息成功', 'type':'success' })
  }

  // 连接蓝牙板卡
  doConnBleCard = () =>{
    this.setState({ st_conn:ST_BLE_CONN, connInfo: MSG_CONN_ING })
    this.doCounter(5)
    openBle(CMD_SEND_ADDR, this.state.cmd, this.dolog)
  }

  // 重置蓝牙板卡
  doResetCard=()=>{
    this.setState({ st_conn:ST_BLE_REST, connInfo: MSG_CONN_REST })
    this.doCounter(3)
    openBle(CMD_RSET_CARD, null, this.dolog)
  }


  doCancel = ()=>{
    this.setState({showConn: false, st_conn: ST_BLE_INIT})
  }

  doScan = ()=>{
    wx.scanCode({
      success(res) {
        let info = JSON.stringify(res.result)
      }
    })
  }

  doShowSearch = ()=>{
    this.setState({status: STATUS_SEAR})
  }

  doHideSearch = ()=>{
    this.setState({status: STATUS_INIT, retList:[], pageNo: 1})
  }

  doSearch = async(e)=>{
    let keyword = fspc(e.detail.value)
    let params = { keyword:keyword }

    this.setState({loading: true, finishSearch:true })
    let r = await this.store.listRes(params)
    let page = parseInt(r.pagination.total/r.pagination.pageSize)+1
    this.setState({retList: r.dataSource, loading: false, page: page})
  }

  doBind = ()=>{
    this.setState({showModal: false})
    Taro.navigateTo({ url: `/pages/headset/index?status=bind` })
  }

  doGotoUser = ()=>{
    Taro.navigateTo({ url: `/pages/user/index` })
  }


  onReachBottom = async() => {
    let {pageNo, retList, page} = this.state

    if (pageNo+1 < page) {
      this.setState({ showActivity: true })
      let params = { keyword:'', pageSize:4, pageNo: pageNo+1 }
      let r = await this.store.listRes(params)
      retList.push(...r.dataSource)
      this.setState({retList: retList, pageNo: pageNo+1,showActivity: false })
    }
  }


  doSwitch = ()=>{
    let u = this.store.getUser()
    this.setState({showSwitch: true,userlist: u })
  }


  doSelRole=async(role,params)=>{
    this.setState({showSwitch: false, loading:true})
    await this.store.switch(params)
    switch(role) {
      case 0: this.initData();break;
      case 1: Taro.switchTab({url:`/pages/config/index`});break;
    } 
  }

  render () {
    const {userlist,showBleconf,showSwitch, showSearch,showConfirm,showConn,status,hisList,retList,loading } = this.state
    const focus = (this.state.finishSearch)?false:true

    return (
      <View className='g-lesson'>
        <AtMessage/>

        <Modal isOpened={this.state.showModal} title={'提示'} confirmText={'去绑定'}
               content="未绑定耳机，请先绑定耳机"  onConfirm = {this.doBind} />

        {(showSwitch)&&<SwitchRole userlist={this.state.userlist} selRole={this.store.getRole()} onSwitch={this.doSelRole} />} 

        {(loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}
        
        {((status===STATUS_INIT)||(status===STATUS_SEAR))&&
        <View className="m-hd">
          <View className="m-tl" onClick={this.doSwitch}>
            <View>张三</View>
            <Image className="f-icon-s" src={icon_switch}></Image>
          </View>
          <Image className="f-icon-s m-icon-user" src={icon_user} onClick={this.doGotoUser}></Image>
        </View>}

        {(status===STATUS_INIT)&&
        <View className="m-bd">
          <View className="f-tl">快速搜索</View>
          <View className="f-search">
            <View className="f-scan-tl">扫码连接</View>
            <View className="f-scan">
              <View className="f-item" onClick={this.doScan}>
                <Image src={icon_scan}></Image>
                <Text>扫一扫</Text>
              </View>
              <View className="f-shadow">
                <View className="f-item"></View>
              </View>
            </View>
            <View className="f-wrap">
              <Image className="f-icon" src={icon_search}></Image>
              <View className="f-input" onClick={this.doShowSearch}>请输入教室名称进行搜索</View>
            </View>
          </View>
          
          <View className="f-tl">最近连接</View>

          {(hisList.length>0)&&
          <View className="m-wrap">
            {hisList.map((item,i)=>
              <View className="f-res" onClick={this.doShowConn.bind(this,item.id)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.deptName}</View>
                  <View className="f-cls">{item.resourceName}</View>
                </View>
                <View className="f-ft">
                  <Image className="f-icon-s" src={icon_microg}></Image>
                </View>
              </View>
            )}
          </View>}


          {(hisList.length===0)&&
          <View className="m-wrap">
            <View className="m-none">
              <Image src={img_none}></Image>
              <Text>暂无数据</Text>
            </View>
          </View>}

        </View>}

        {(status===STATUS_SEAR)&&
        <View className="m-bd">
          <View className="f-sear">
            <View className="f-wrap">
              <Image className="f-icon-s" src={icon_search}></Image>
              <Input className="f-input" 
                     placeholder="请输入教室名称进行搜索"  
                     onConfirm={this.doSearch}
                     confirm-type="search" focus={focus}></Input>
            </View>
            <View className="f-cancel" onClick={this.doHideSearch}> 取消</View>
          </View>

          {(retList.length!==0)&&
          <View className="m-count">
             搜索到 <Text>{retList.length}</Text> 条相关内容
          </View>}
          {(retList.length!==0)&&
          <View className="m-wrap">
            {retList.map((item,i)=>
              <View className="f-res" onClick={this.doShowConn.bind(this,item.id)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.deptName}</View>
                  <View className="f-cls">{item.resourceName}</View>
                </View>
                <View className="f-ft">
                  <Image className="f-icon-s" src={icon_microg}></Image>
                </View>
              </View>
            )}
            {retList.map((item,i)=>
              <View className="f-res" onClick={this.doShowConn.bind(this,item.id)}>
                <View className="f-hd">
                  <Image className="f-icon" src={icon_house}></Image>
                </View>
                <View className="f-bd">
                  <View className="f-bud">{item.deptName}</View>
                  <View className="f-cls">{item.resourceName}</View>
                </View>
                <View className="f-ft">
                  <Image className="f-icon-s" src={icon_microg}></Image>
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

        {(showConn)&&
        <View className="g-conn">
          <View className="m-wrap">
            <View className="m-hd">
              {((this.state.st_conn == ST_BLE_INIT)||(this.state.st_conn == ST_BLE_SUCC)||(this.state.st_conn == ST_BLE_FAIL)||(this.state.st_conn===ST_BLE_FINN))&&
              <Image src={img_lesson} mode="widthFix"> </Image>}

              {((this.state.st_conn == ST_BLE_CONN)||(this.state.st_conn == ST_BLE_REST))&&
              <View className="m-count">{this.state.count}</View>}
            </View>
            
            <View className="m-info">
              <View className="m-cls f-blue">广知楼 A-101</View>
              <View className="m-cls">{this.state.connInfo}</View>
            </View>

            {(this.state.st_conn===ST_BLE_INIT)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doCancel}>取消</View>
              <View className="m-btn f-blue" onClick={this.doConnBleCard}>确定</View>
            </View>}

            {((this.state.st_conn===ST_BLE_SUCC)||(this.state.st_conn===ST_BLE_FINN))&&
            <View className="m-fun">
              <View className="m-btn f-blue" onClick={this.doCancel}>确定</View>
            </View>}

            {(this.state.st_conn===ST_BLE_FAIL)&&
            <View className="m-fun">
              <View className="m-btn" onClick={this.doCancel}>取消</View>
              <View className="m-btn f-blue" onClick={this.doResetCard}> 重启</View>
            </View>}

          </View>
        </View>}

      </View>
    )
  }
}

export default Lesson
