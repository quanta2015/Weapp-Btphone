export default {
  pages: [
    
    'pages/index/index',
    'pages/lesson/index',
    'pages/headset/index',
    'pages/user/index',
    'pages/blank/index',
    // 'pages/openlink/index',
    
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
      pagePath: 'pages/index/index',
    },{
      pagePath: 'pages/lesson/index',
    },{
      pagePath: 'pages/blank/index',
    }]
  }
}
