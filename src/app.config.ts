export default {
  pages: [
    
    'pages/index/index',
    'pages/lesson/index',
    'pages/headset/index',
    'pages/config/index',
    'pages/user/index',
    'pages/demo/index',
    
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '湖山亮嗓',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    "borderStyle":"white",
    list: [{
      pagePath: 'pages/lesson/index',
    },{
      pagePath: 'pages/config/index',
    },{
      pagePath: 'pages/index/index',
    }]
  }
}
