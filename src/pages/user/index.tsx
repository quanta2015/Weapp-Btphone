import { Component } from 'react'
import { View, Button, Text,Form, Input, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'

import { AtMessage, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Modal from '../../utils/modal'

import './index.scss'
import {API_SERVER} from '../../constant/apis'


// var list = [{ name:'广知楼', cls: 'A-101', idx: '8101'},
//             { name:'广知楼', cls: 'A-102', idx: '8101'},
//             { name:'广知楼', cls: 'A-103', idx: '8101'},
//             { name:'广知楼', cls: 'A-104', idx: '8101'},
//             { name:'广知楼', cls: 'A-105', idx: '8101'},
//             { name:'广知楼', cls: 'A-106', idx: '8101'},
//             { name:'广知楼', cls: 'A-107', idx: '8101'},
//             { name:'广知楼', cls: 'A-108', idx: '8101'},]

var _ST_TIME,count
var TIME_WAIT   = 3
var icon_return = `${API_SERVER}/static/return.svg`
var icon_search = `${API_SERVER}/static/search.svg`
var icon_microg = `${API_SERVER}/static/microp_g.svg`
var icon_microc = `${API_SERVER}/static/microp_c.svg`
var icon_user   = `${API_SERVER}/static/user.svg`
var icon_user2  = `${API_SERVER}/static/user2.svg`
var icon_house  = `${API_SERVER}/static/house.svg`
var icon_scan   = `${API_SERVER}/static/scan.svg`
var img_lesson  = `${API_SERVER}/static/lesson.png`
var img_none    = `${API_SERVER}/static/none.png`

var icon_good   = `${API_SERVER}/static/icon_good.svg`
var icon_go     = `${API_SERVER}/static/icon_go.svg`
var icon_child  = `${API_SERVER}/static/icon_child.svg`
var icon_conf   = `${API_SERVER}/static/icon_conf.svg`
var icon_headset= `${API_SERVER}/static/icon_headset.svg`
var icon_help   = `${API_SERVER}/static/icon_help.svg`
var icon_quick  = `${API_SERVER}/static/icon_quick.svg`
var icon_star   = `${API_SERVER}/static/icon_star.svg`

var STATUS_INIT = 0
var STATUS_SEAR = 1
var STATUS_USER = 2



@inject('store')
@observer
class User extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      showSearch: false,
      showConfirm: false,
      showConn: false,
      count: TIME_WAIT,
      status: STATUS_USER,
      hisList: [],
      retList: [],
      bind: false,
      showModal: false,
    }
  }



  async componentDidMount () { 
    
  }


  doGotoHeadset=()=>{
    Taro.navigateTo({ url: `/pages/headset/index` })
  }

  

  render () {

    return (
      <View className="g-user">
        <View className="m-hd">
          <View className="m-tl">我的</View>
        </View>
        <View className="m-user">
          <Image src={icon_user2}> </Image>
          <Text> 旺旺旺</Text>
        </View>

        <View className="m-sect">
          <View className="m-row">
            <Image className="f-icon" src={icon_good}> </Image>
            <Text>点赞评论</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>

          <View className="m-row">
            <Image className="f-icon" src={icon_help}> </Image>
            <Text>我的动态</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>
        </View>

        <View className="m-sect">
          <View className="m-row">
            <Image className="f-icon" src={icon_star}> </Image>
            <Text>收藏</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>
        </View>

        <View className="m-sect">
          <View className="m-row">
            <Image className="f-icon" src={icon_child}> </Image>
            <Text>小助理</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>

          <View className="m-row">
            <Image className="f-icon" src={icon_quick}> </Image>
            <Text>快捷入口</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>

          <View className="m-row" onClick={this.doGotoHeadset}>
            <Image className="f-icon" src={icon_headset}> </Image>
            <Text>我的耳机</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>
        </View>

        <View className="m-sect">
          <View className="m-row">
            <Image className="f-icon" src={icon_conf}> </Image>
            <Text>关怀模式</Text>
            <Image className="f-icon" src={icon_go} > </Image>
          </View>
        </View>

      </View>


    )
  }
}

export default User
