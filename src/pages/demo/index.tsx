import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import Taro from '@tarojs/taro'
import { View, Button, Image, Text,ScrollView } from '@tarojs/components'
import './index.scss'
import { AtMessage } from 'taro-ui'
import icon_load    from '../../static/loading.svg'
import icon_house   from '../../static/house.svg'



@inject('store')
@observer
class Page extends Component {
  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      loading: false,
      retList: [],
      pageNo: 1,
    }
  }


  async componentDidShow () { 
    this.setState({loading: true })
    await this.store.init()

    let params = { keyword:'', pageSize:4, pageNo:1 }
    let r = await this.store.listRes(params)
    this.setState({retList: r.dataSource, loading: false, pageSize: r.pagination.pageSize})

    console.log(r)
  }

  doBottom=async(e)=>{
    console.log('bottom')
    let {pageNo, retList, pageSize} = this.state

    if (pageNo+1 <= pageSize) {
      this.setState({loading: true })
      let params = { keyword:'', pageSize:4, pageNo: pageNo+1 }
      let r = await this.store.listRes(params)
      retList.push(...r.dataSource)
      this.setState({retList: retList, loading: false, pageNo: pageNo+1})
    }else{
      // Taro.atMessage({ "message": `全部数据加载`, "type": "error" })
    }
  }

  render() {
    const scrollTop = 0
    const Threshold = 20
    let retList = this.state.retList


    return (
      <View className="g-m">
        <AtMessage/>
        {(this.state.loading)&&<View className="g-loading"><Image src={icon_load}></Image></View>}

        <View className="m-hd">title</View>
        <ScrollView
          className="m-sv"
          scrollY
          scrollWithAnimation
          enableFlex={true}
          lowerThreshold={20}
          onScrollToLower={this.doBottom} 
          onScroll={this.onScroll}
        >
          {retList.map((item,i)=>
            <View className="f-ress">
              <View className="f-hd">
                <Image className="f-icon" src={icon_house}></Image>
              </View>
              <View className="f-bd">
                <View className="f-bud">{item.resourceName}</View>
              </View>
            </View>
          )}
          {retList.map((item,i)=>
            <View className="f-ress">
              <View className="f-hd">
                <Image className="f-icon" src={icon_house}></Image>
              </View>
              <View className="f-bd">
                <View className="f-bud">{item.resourceName}</View>
              </View>
            </View>
          )}
          {retList.map((item,i)=>
            <View className="f-ress">
              <View className="f-hd">
                <Image className="f-icon" src={icon_house}></Image>
              </View>
              <View className="f-bd">
                <View className="f-bud">{item.resourceName}</View>
              </View>
            </View>
          )}
          
        </ScrollView>

      </View>
      
    )
  }
}

export default Page

