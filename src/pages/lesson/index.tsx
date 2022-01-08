import { Component } from 'react'
import { View, Button, Text,Form, Input, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'

import { AtMessage, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Modal from '../../utils/modal'
import {openBle,bleCommand} from '../../utils/bt'

import './index.scss'
import {API_SERVER} from '../../constant/apis'


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



// 状态机定义
var STATUS_INIT   = 0
var STATUS_SEAR   = 1
var CMD_SEND_ADDR = 1
var CMD_RSET_CARD = 2


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
      showConfirm:  false,
      showBleconf:  false,
      finishSearch: false,
      status: STATUS_INIT,
      hisList: [],
      retList: [],
      macAddr: null,
    }
  }


  dolog = async()=>{
    let {info} = this.state
    let s = await this.store.saveConnInfo(info)
    console.log(s)
    Taro.atMessage({ 'message':'保存连接信息成功', 'type':'success' })
  }

  async componentDidShow() {
    this.setState({loading: true })
    let s = await this.store.listResHis()
    this.setState({hisList: s.dataSource})
    
    let r = await this.store.loadHsAddr()
    let data = r.dataSource
    if (data.length>0) {
      this.setState({bind: true, macAddr:data[0].itemCode, loading: false })
    }else{
      this.setState({loading: false })
    }
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
        this.setState({ loading: false, showConn: true, cmd:command, info:info })
      }
    }else{
      this.setState({showModal: true})
    }
  }

  doConnBleCard = () =>{
    this.setState({ showConn: false })
    openBle(CMD_SEND_ADDR, this.state.cmd, this.dolog)
  }


  doCancel = ()=>{
    this.setState({showConn: false})
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
    this.setState({status: STATUS_INIT})
  }

  doSearch = async(e)=>{
    let keyword = e.detail.value
    let params = { keyword:keyword }

    this.setState({loading: true, finishSearch:true })
    let r = await this.store.listRes(params)
    this.setState({retList: r.dataSource, loading: false})
  }

  doBind = ()=>{
    Taro.navigateTo({ url: `/pages/headset/index?status=bind` })
  }

  doGotoUser = ()=>{
    Taro.navigateTo({ url: `/pages/user/index` })
  }

  render () {
    const { showBleconf,showSearch,showConfirm,showConn,status,hisList,retList,showModal,loading } = this.state
    const focus = (this.state.finishSearch)?false:true

    return (
      <View className='g-lesson'>
        <AtMessage/>

        <Modal isOpened={showModal} 
               title={'提示'}
               content="未绑定耳机，请先绑定耳机"
               confirmText={'去绑定'}
               onConfirm = {this.doBind} />

        {(loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}
        
        {((status===STATUS_INIT)||(status===STATUS_SEAR))&&
        <View className="m-hd">
          <View className="m-tl">张三</View>
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
          <View className="m-count">
             搜索到 <Text>{retList.length}</Text> 条相关内容
          </View>
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
          </View>
        </View>}

        {(showConn)&&
        <View className="g-conn">
          <View className="m-wrap">
            <Image src={img_lesson} mode="widthFix"> </Image>
            <View className="m-info">
              <View className="m-cls f-blue">广知楼 A-101</View>
              <View className="m-cls">确定要连接，开始上课吗？</View>
            </View>
            <View className="m-fun">
              <View className="m-btn" onClick={this.doCancel}>取消</View>
              <View className="m-btn f-blue" onClick={this.doConnBleCard}>确定</View>
            </View>
          </View>
        </View>}

      </View>
    )
  }
}

export default Lesson
