import Taro,{ Current } from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage } from 'taro-ui'
import './index.scss'


import icon_load    from '../../static/loading.svg'
import icon_teac    from '../../static/icon_teacher.svg'
import icon_work    from '../../static/icon_worker.svg'

const SEL_TEAC = 0
const SEL_WORK = 1

@inject('store')
@observer
class Index extends Component {
  
  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      params: '',
      sel: SEL_TEAC,
    }
  }

  doSel = (e) => { 
    this.setState({sel: e})
  }

  doNext = () => {
    switch(this.state.sel) {
      case SEL_TEAC: Taro.switchTab({ url: `/pages/lesson/index` });break;
      case SEL_WORK: Taro.switchTab({ url: `/pages/config/index` });break; 
    }
  }

  async componentWillMount() {
    let url = unescape(unescape(Current.router.params.q))
    console.log(url)
    let params = (url==="undefined")?"no params":url.split("?")[1].split("=")[1]
    this.setState({loading: true, params: params })

    // 获取角色列表
    let r = await this.store.init()
    switch(r.role) {
      case 'both': params = r.emp[0];break;
      case 'emp':  params = r.emp[0];break;
      case 'out':  params = r.out[0];break;
    }

    await this.store.switch(params)

    switch(r.role) {
      case 'both': Taro.switchTab({ url: `/pages/lesson/index` });break;
      case 'emp':  Taro.switchTab({ url: `/pages/lesson/index` });break;
      case 'out':  Taro.switchTab({ url: `/pages/config/index` });break;
    }
    
  }
 
  render () {
    let { params,loading,sel } = this.state
    
    return (
      <View className='g-index'>
        <AtMessage/>  
        {(loading)&&<View className="g-loading g-loading-init"><Image src={icon_load}></Image></View>}

        <View className="m-sp">请选择您的身份</View>
        <View className={(sel===0)?"m-btn sel":"m-btn"} onClick={this.doSel.bind(this,0)}>
          <Image src={icon_teac}></Image>
          <Text>教师</Text>
        </View>
        <View className={(sel===1)?"m-btn sel":"m-btn"} onClick={this.doSel.bind(this,1)}>
          <Image src={icon_work}></Image>
          <Text>维护人员</Text>
        </View>
        <View className="m-next" onClick={this.doNext}>下一步</View>
        <View className="m-sp"></View>
        <View className="m-info">{params}</View>
      </View>
    )
  }
}

export default Index
