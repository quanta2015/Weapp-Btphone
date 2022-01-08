import Taro,{ Current } from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import './index.scss'


import icon_load    from '../../static/loading.svg'


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
    Taro.switchTab({ url: `/pages/lesson/index` })
  }

  doShowW=() => { 
    Taro.switchTab({ url: `/pages/config/index` })
  }

  async componentWillMount() {
    let url = unescape(unescape(Current.router.params.q))
    console.log(url)
    let params = (url==="undefined")?"no params":url.split("?")[1].split("=")[1]
    this.setState({loading: true, params: params })
    await this.store.init()
    this.setState({loading: false, })
  }
 
  render () {
    let { params,loading } = this.state
    
    return (
      <View className='g-index'>
        {(loading)&&<View className="g-loading g-loading-init"><Image src={icon_load}></Image></View>}

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
