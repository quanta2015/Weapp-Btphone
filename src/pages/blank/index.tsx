import { Component } from 'react'
import { View, Button, Text,Form, Input, Image, Radio } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import dayjs from 'dayjs'
import Taro,{ getCurrentInstance } from '@tarojs/taro'
import { AtMessage, AtActivityIndicator } from "taro-ui";
import {openBle,bleCommand} from '../../utils/bt'
import {isN,fspc,urlParams} from '../../utils/fn'
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



@inject('store')
@observer
class Lesson extends Component {

  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      
    }
  }

  doLogin=()=>{
    Taro.switchTab({ url: `/pages/index/index` });
  }

  render () {

    return (
      <View className='g-lesson'>
       
        

        <View className="m-hd">
          <View className="m-tl">
            <View>未登录</View>
            <Image className="f-icon-s" src={icon_switch}></Image>
          </View>
          <Image className="f-icon-s m-icon-user" src={icon_user}></Image>
        </View>

        <View className="m-bd">
          <View className="f-tl">快速搜索</View>
          <View className="f-search">
            <View className="f-scan-tl">扫码连接</View>
            <View className="f-scan">
              <View className="f-item">
                <Image src={icon_scan}></Image>
                <Text>扫一扫</Text>
              </View>
              <View className="f-shadow">
                <View className="f-item"></View>
              </View>
            </View>
            <View className="f-wrap">
              <Image className="f-icon" src={icon_search}></Image>
              <View className="f-input">请输入教室名称进行搜索</View>
            </View>
          </View>
          
          <View className="f-tl">最近连接</View>


          <View className="m-none">无资源数据</View>

          <View className="m-login" onClick={this.doLogin}>登 录</View>

        </View>

      </View>
    )
  }
}

export default Lesson
