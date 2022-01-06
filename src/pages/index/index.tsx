import { Component } from 'react'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import Taro from '@tarojs/taro'
import './index.scss'
import { Current } from '@tarojs/taro'
import req from '../../utils/request'


@inject('store')
@observer
class Index extends Component {
  
  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      params: '',
    }
  }

  doShowT=() => { 
    Taro.navigateTo({ url: `/pages/lesson/index` })
  }

  doShowW=() => { 
    Taro.navigateTo({ url: `/pages/config/index` })
  }

  async componentWillMount() {
    let url = unescape(unescape(Current.router.params.q))
    console.log(url)
    let params = (url==="undefined")?"no params":url.split("?")[1].split("=")[1]
    this.setState({params: params})

    // let mobile    = '18969940931'
    // let appid     = 'wx92eeddb23714a9c4'

    // let jscode=(code) =>{ return `https://gateway.community-sit.easyj.top/auth/oauth/token?client_id=sit&client_secret=sit&grant_type=password&from=wx_app&appId=${appid}&mobile=${mobile}&code=${code}` } 

    // let code  = await this.store.weLogin()
    // let ret   = await req.get(jscode(code))
    // let token = ret.data.data.accessToken



    // let url = "https://gateway.community-dev.easyj.top/user-center/mobile/assets/employee/assetsDetail"
    // let auth  = `Bearer ${token}`

    // let ret2 = await req.get(src,'auth',auth)

    // console.log(ret)
  }
 
  render () {
    let { params } = this.state


    
    return (
      <View className='g-index'>
        <View className="m-sp"></View>
        <View className="m-btn" onClick={this.doShowT}>教师</View>
        <View className="m-btn" onClick={this.doShowW}>维护人员</View>
        <View className="m-sp"></View>
        <View className="m-info">{params}</View>
      </View>
    )
  }
}

export default Index
