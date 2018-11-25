//app.js
App({
  //http://10.100.255.107:8081
  serverUrl:"http://10.100.178.61:8082",
  //全局对象!!!是一个对象！！！
  userInfo:null,
  //用全局缓存保存用户的登录信息
  setGlobalUserInfo:function(User){
    wx.setStorageSync("userInfo", User)
  },
  getGlobalUserInfo:function(){
    return wx.getStorageSync("userInfo")
  },
  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})