import Taro,{ Current } from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Image } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage } from 'taro-ui'
import {fspc, isN} from '../../utils/fn'
import Modal  from '../../utils/modal'

import './index.scss'


import icon_load    from '../../static/loading.svg'
import icon_teac    from '../../static/icon_teacher.svg'
import icon_work    from '../../static/icon_worker.svg'
import icon_logo    from '../../static/logo.svg'


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

  router = async(mobile) =>{
    let params
    let r = await this.store.init(mobile)
    switch(r.role) {
      case 'emp': 
        await this.store.switch(r.emp[0])
        Taro.switchTab({ url: `/pages/lesson/index` });
        break;
      case 'out':  
        await this.store.switch(r.out[0])
        Taro.switchTab({ url: `/pages/config/index` });
        break;
    }
  }

  async componentWillMount() {
    let rid, oid, params,role
    let url = unescape(unescape(Current.router.params.q))
    // console.log(url)
    
    if (url !== "undefined") {
      params = url.split("?")[1]
      let list = params.split("&")
      if (list.length>1) {
        rid = list[0].split("=")[1]
        oid = list[1].split("=")[1]
        this.store.setScanRid(rid)
        this.store.setScanOid(oid)
        this.store.setScanTo('out')
      }else{
        rid = list[0].split("=")[1]
        this.store.setScanRid(rid)
        this.store.setScanTo('emp')
      }
    }else{
      this.store.setScanRid(null) 
    }

    let mobile = this.store.loadPhone()
    if (isN(mobile)) {
      let code = await this.store.weLogin()
      this.setState({ params: params, showModal:true, code:code })
    }else{
      this.setState({ loading: true })
      this.router(mobile)
    }
  }

  doGetPhone = async(e) =>{
    let params
    let { encryptedData, iv} = e.detail
    let { code } = this.state

    this.setState({ showModal:false, loading: true })
    let s = await this.store.getPhone(code,encryptedData, iv)
    let mobile = s.data.phoneNumber
    this.store.savePhone(mobile)
    this.router(mobile)
  }

  doClose=()=>{
    console.log('close')
  }
 
  render () {
    let { params,loading,sel } = this.state
    
    return (
      <View className='g-index'>
        <AtMessage/>  
        {(loading)&&<View className="g-loading g-loading-init"><Image src={icon_load}></Image> </View>}

        <Modal isOpened={this.state.showModal} 
               title={'微信授权'} 
               content="申请获取您微信绑定的手机号" 
               phoneText={'授权'}
               cancelText={'拒绝'}
               onCancel={this.doClose}
               onPhone = {this.doGetPhone} />

        <View className='m-logo'>
          
        </View>

        {/*<View className="m-sp">请选择您的身份</View>
        <View className={(sel===0)?"m-btn sel":"m-btn"} onClick={this.doSel.bind(this,0)}>
          <Image src={icon_teac}></Image>
          <Text>教师</Text>
        </View>
        <View className={(sel===1)?"m-btn sel":"m-btn"} onClick={this.doSel.bind(this,1)}>
          <Image src={icon_work}></Image>
          <Text>维护人员</Text>
        </View>
        <View className="m-next" onClick={this.doNext}>下一步</View>
        <View className="m-sp"></View>*/}
        <View className="m-info">{params}</View>
      </View>
    )
  }
}

export default Index
