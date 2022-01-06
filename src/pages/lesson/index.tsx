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
var img_load    = `${API_SERVER}/static/loading.svg`


var STATUS_INIT = 0
var STATUS_SEAR = 1
var STATUS_USER = 2



@inject('store')
@observer
class Home extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      showSearch: false,
      showConfirm: false,
      showConn: false,
      count: TIME_WAIT,
      status: 0,
      hisList: [],
      retList: [],
      bind: false,
      showModal: false,
      loading: false,
    }
  }



  async componentDidMount () { 

    this.setState({loading: true })
    await this.store.init()
    // let r = await this.store.listResHis()
    let s = await this.store.listRes()
    this.setState({hisList: s.dataSource})
    
    let r = await this.store.loadHsAddr()
    let data = r.dataSource
    if (data.length>0) {
      this.setState({bind: true, macAddr:data[0].itemCode, loading: false })
    }else{
      this.setState({loading: false })
    }
  }

  doShowConn=()=>{
    if (this.state.bind) {
      this.setState({showConn: true})
    }else{
      this.setState({showModal: true})
    }
  }

  doCancel=()=>{
    this.setState({showConn: false})
  }

  doScan=()=>{
    wx.scanCode({
      success(res) {
        let info = JSON.stringify(res.result)
      }
    })
  }

  doShowSearch=()=>{
    this.setState({status: STATUS_SEAR})
  }

  doHideSearch=()=>{
    this.setState({status: STATUS_INIT})
  }

  doSearch=async(e)=>{
    let keyword = e.detail.value
    let params = { keyword:keyword }

    this.setState({loading: true })
    let r = await this.store.listRes(params)
    this.setState({retList: r.dataSource, loading: false})
  }

  doBind=()=>{
    Taro.navigateTo({ url: `/pages/headset/index?status=bind` })
  }

  doGotoUser=()=>{
    Taro.navigateTo({ url: `/pages/user/index` })
  }

  render () {
    const { showSearch,showConfirm,showConn,count,status,hisList,retList,showModal,loading } = this.state
    const focus = (loading)?false:true

    return (
      <View className='g-lesson'>
        <AtMessage/>

        <Modal isOpened={showModal} 
               title={'提示'}
               content="未绑定耳机，请先绑定耳机"
               onConfirm = {this.doBind} />

        {(loading)&&<View className="g-loading"><Image src={img_load}></Image></View>}
        
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
              <View className="f-res" onClick={this.doShowConn}>
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
              <View className="f-res" onClick={this.doShowConn}>
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
              <View className="m-btn f-blue" onClick={this.doCancel}>确定</View>
            </View>
          </View>
        </View>}


        {(status===STATUS_USER)&&
        <View className="g-user">
          <View className="m-hd">
            <View className="m-return" onClick={this.doReturn}>
              <Image className="f-icon " src={icon_return}></Image>
            </View>
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

            <View className="m-row">
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

        </View>}


      </View>
    )
  }
}

export default Home
