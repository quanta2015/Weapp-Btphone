import { Component } from 'react'
import { View, Button, Text,Form, Input, Image, Textarea } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { getCurrentInstance } from '@tarojs/taro'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'

import { AtMessage, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Modal from '../../utils/modal'

import './index.scss'
import {API_SERVER} from '../../constant/apis'


var icon_return = `${API_SERVER}/static/return.svg`
var icon_search = `${API_SERVER}/static/search.svg`
var icon_microg = `${API_SERVER}/static/microp_g.svg`
var icon_microc = `${API_SERVER}/static/microp_c.svg`
var icon_user   = `${API_SERVER}/static/user.svg`
var icon_user2  = `${API_SERVER}/static/user2.svg`
var icon_house  = `${API_SERVER}/static/house.svg`
var icon_scan   = `${API_SERVER}/static/scan_b.svg`
var img_lesson  = `${API_SERVER}/static/lesson.png`
var img_none    = `${API_SERVER}/static/none.png`
var icon_headset= `${API_SERVER}/static/icon_headset.svg`
var img_info    = `${API_SERVER}/static/info.png`
var img_load    = `${API_SERVER}/static/loading.svg`

var STATUS_INIT = 0
var STATUS_BIND = 1
var STATUS_EDIT = 2



@inject('store')
@observer
class User extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      status: STATUS_INIT,
      bind: false,
      id: null,
      addr: null,
      remark: null,
      loading: false,
    }
  }



  async componentDidMount () {
    let params = getCurrentInstance().router.params

    if (params.status === 'bind' ) {
      this.setState({status: STATUS_BIND})
      this.doScan()
    }else{
      this.setState({loading: true})
      // await this.store.init() 
      // console.log('token',this.store.getToken())
      let r = await this.store.loadHsAddr()
      let data = r.dataSource
      if (data.length>0) {
        this.setState({
          loading: false,
          bind: true, 
          id:data[0].id, 
          addr:data[0].itemCode, 
          remark:data[0].remark, 
        })
      }else{
        this.setState({loading: false })
      }
    }
  }


  doUpdateItem=async ()=>{
    let params = {
      id: this.state.id,
      itemCode: this.state.addr,
      remark: this.state.remark,
    }
    this.setState({loading: true})
    let r = await this.store.addrUpdate(params)
    this.setState({loading: false, status: STATUS_INIT})
  }

  doBindItem=async ()=>{
    let params = {
      itemCode: this.state.addr,
      remark:   this.state.remark,
    }
    this.setState({loading: true })
    let r = await this.store.addrBind(params)
    this.setState({loading: false, status: STATUS_INIT, bind: true})
  }

  doBind=()=>{
    this.setState({status: STATUS_BIND })
  }
  doUnBind=()=>{
    this.setState({status: STATUS_INIT })
  }

  doScan=()=>{
    let that = this
    wx.scanCode({
      success(res) { that.setState({ addr: res.result}) }
    })
  }


  doChgAddr=(e)=>{
    this.setState({ addr: e.target.value})
  }

  doChgRemark=(e)=>{
    this.setState({ remark: e.target.value})
  }

  doEdit=()=>{
    this.setState({status: STATUS_EDIT })
  }
  

  

  render () {
    const { e_code,status,bind,addr,remark,loading } = this.state
    
    return (
      <View className="g-headset">

        {(loading)&&<View className="g-loading"><Image src={img_load}></Image></View>}


        <View className="m-hd">
          <View className="m-tl">我的耳机</View>
        </View>

        {(status===STATUS_INIT)&&
        <View className="m-ret">
          {(!bind)&&
          <View className="m-wrap">
            <View className="m-none">
              <Image src={img_none}></Image>
              <Text>暂无设备</Text>
            </View>
            <View className="m-bind" onClick={this.doBind}>绑定设备</View>
          </View>}

          {(bind)&&
          <View className="m-hs" onClick={this.doEdit}>
            <Image className="f-icon" src={icon_headset}></Image>
            <View className="m-tl">{this.state.addr}</View>
            <View className="m-cnt">{this.state.remark}</View>
          </View>}
        </View>}

        {((status===STATUS_BIND)||(status===STATUS_EDIT))&&
        <View className="g-bind">
          <View className="m-row">
            <View className="m-tl">耳机编号</View>
            <View className="m-form">
              <Input placeholder="请输入或扫码" value={addr} onInput={this.doChgAddr} />
              <Image className="f-icon" src={icon_scan} onClick={this.doScan}></Image>
            </View>
          </View>
          
          <View className="m-row m-row-c">
            <View className="m-tl">耳机备注</View>
            <Textarea placeholder="请输入..." value={remark} onInput={this.doChgRemark}></Textarea>
          </View>

          <View className="m-help">
            <View className="m-wrap">绑定操作说明，点击查看 ></View>
          </View>
          
          {(status===STATUS_BIND)&&
          <View className="m-fun">
            <View className="m-btn" onClick={this.doBindItem}> 绑定设备</View>
            <View className="m-btn" onClick={this.doUnBind}> 取消</View>
          </View>}

          {(status===STATUS_EDIT)&&
          <View className="m-fun">
            <View className="m-btn" onClick={this.doUpdateItem}> 更换设备</View>
            <View className="m-btn" onClick={this.doUnBind}> 返回</View>
          </View>}


        </View>}
      </View>


    )
  }
}

export default User
