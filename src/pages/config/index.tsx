import { Component } from 'react'
import { View, Button, Text, Input, Image,Picker } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'

import { AtMessage } from 'taro-ui'


import './index.scss'
import {API_SERVER} from '../../constant/apis'


var addrList = [{ name:'行知小学'},
                { name:'学军小学'},
                { name:'建兰小学3'},
                { name:'文一小学'},
                { name:'翠园小学'},
                { name:'宏鑫小学'},]
var clsList  =  [{ name:'求是楼-A101'},
                { name:'求是楼-A102'},
                { name:'求是楼-A103'},
                { name:'求是楼-A104'},
                { name:'求是楼-A105'},
                { name:'求是楼-A106'},]
var typeList = ['音响板卡', '广告电视']

var icon_refresh= `${API_SERVER}/static/refresh.svg`
var icon_search = `${API_SERVER}/static/search.svg`
var icon_return = `${API_SERVER}/static/return.svg`
var icon_user   = `${API_SERVER}/static/user.svg`
var icon_house  = `${API_SERVER}/static/house.svg`
var icon_scan   = `${API_SERVER}/static/scan_b.svg`
var img_info    = `${API_SERVER}/static/info.png`
var img_none    = `${API_SERVER}/static/none.png`

var STATUS_INIT = 0
var STATUS_ADDR = 1
var STATUS_CLAS = 2
var STATUS_BIND = 3
var STATUS_EDIT = 4

@inject('store')
@observer
class Home extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      showInfo: false,
      selAddr: -1,
      selCls: -1,
      status: STATUS_INIT,
      
      e_code: null,
      e_type: null,
      e_name: null,
      equList: [],
    }
  }


  async componentDidShow () { 
    
  }


  doSelAddr =(e)=>{
    this.setState({showInfo: true, selAddr: e, status: STATUS_ADDR})
  }

  doSelCls =(e)=>{
    this.setState({selCls: e, status: STATUS_CLAS})
  }

  doBind =()=>{
    this.setState({showInfo:false, status: STATUS_BIND})
  }

  doScan=()=>{
    let that = this
    wx.scanCode({
      success(res) { that.setState({ e_code: res.result}) }
    })
  }

  doSelType=(e)=>{
    this.setState({ e_type: typeList[e.detail.value] })
  }

  doChgName=(e)=>{
    this.setState({ e_name: e.target.value})
  }

  doChgCode=(e)=>{
    this.setState({ e_code: e.target.value})
  }

  doBindItem=()=>{
    let {equList,e_code,e_type,e_name} = this.state

    if ((e_code===null)||(e_type===null)||(e_name===null)) {
      Taro.atMessage({ "message": "请输入信息", "type": "success", })
    }else{
      equList.push({
        code: e_code,
        type: e_type,
        name: e_name,
      })
      this.setState({
        status: STATUS_CLAS,
        e_code: null,
        e_type: null,
        e_name: null,
        equList: equList,
        showInfo: true,
      })
    }
  }

  doEdit =(e)=>{
    this.setState({ status: STATUS_EDIT, showInfo: false })
  }

  doChgEqu=(e)=>{
   
  }

  doRepair=(e)=>{
   
  }


  doReturn=()=>{
    let {status} = this.state 

    switch(status) {
      case STATUS_ADDR: this.setState({status: STATUS_INIT,showInfo: false }); break;
      case STATUS_CLAS: this.setState({status: STATUS_ADDR }); break;
      case STATUS_BIND: this.setState({status: STATUS_CLAS,showInfo: true }); break;
      case STATUS_EDIT: this.setState({status: STATUS_CLAS,showInfo: true }); break;

    }
    
  }


  render () {
    const { showInfo,selAddr,selCls,
      status,e_name,e_code,e_type,equList } = this.state
    let addr 
    switch(status) {
      case STATUS_INIT:   addr = '';break;
      case STATUS_ADDR: addr = (showInfo)?addrList[selAddr].name:"";break;
      case STATUS_CLAS: addr = (showInfo)?clsList[selCls].name:"";break;
    }
    

    return (
      <View className='g-home'>
        <AtMessage/>

        {((status!== STATUS_BIND)&&(status!==STATUS_EDIT))&&
        <View className="m-hd">
          <View className="m-user">张三</View>
          <Image className="f-icon-s f-icon-user" src={icon_user}></Image>
        </View>}

        {((status=== STATUS_BIND)||(status===STATUS_EDIT))&&
        <View className="m-hd">
          <View className="m-return" onClick={this.doReturn}>
            <Image className="f-icon" src={icon_return}></Image>
          </View>
          <View className="m-user">绑定设备</View>
          <Image className="f-icon-s f-icon-user" src={icon_user}></Image>
        </View>}


        {(showInfo)&&
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
              <Input className="f-input" placeholder="请输入教室名称进行搜索"></Input>
            </View>
          </View>}
          
          {(status===STATUS_INIT)&&<View className="f-tl">最近连接</View>}

          {(status==STATUS_INIT)&&
          <View className="m-wrap">
            {addrList.map((item,i)=>
              <View className="f-res" onClick={this.doSelAddr.bind(this,i)}>
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

          {(status==STATUS_ADDR)&&
          <View className="m-wrap">
            {clsList.map((item,i)=>
              <View className="f-res" onClick={this.doSelCls.bind(this,i)}>
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
                <View className="m-item" onClick={this.doEdit}>
                  <View className="m-name">{item.name}</View>
                  <View className="m-label">{item.type}</View>
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
                <Picker mode='selector' range={typeList} onChange={this.doSelType}>
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

export default Home
