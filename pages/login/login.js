// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoInfo: ''
  },
  onLoad: function(params) {
    var me = this;
    var videoInfo = '';
    if (params.videoInfo == null || params.videoInfo == '' || params.videoInfo == undefined) {
      videoInfo = '';
    } else {
      videoInfo = params.videoInfo;
    }
    me.setData({
      videoInfo: videoInfo
    })
  },
  doLogin: function(e) {
    var me=this;
    var formObeject = e.detail.value;
    var username = formObeject.username;
    var password = formObeject.password;
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        //icon要设为空，否则会出错，不知道为什么，靴靴!!!
        icon: 'none',
        duration: 2000
      })
    } else {
      var serverUrl = app.serverUrl;
      console.log(serverUrl);
      //显示等待框
      wx.showLoading({
        title: '请耐心等待',
      })
      wx.request({
        url: serverUrl + '/login',
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          var status = res.data.status;
          if (status == 200) {
            console.log(res.data);
            //隐藏等待框
            wx.hideLoading();
            wx.showToast({
              title: '登录成功,吸入了',
              icon: 'success',
              duration: 2000
            });
            //成功的话把返回的data赋值给全局变量userInfo
            //注意是res.data.data
            // app.userInfo = res.data.data;
            app.setGlobalUserInfo(res.data.data);

            if (me.data.videoInfo == '') {
              //未登录情况下登录之后跳转到个人信息页面
              wx.redirectTo({
                url: '../mine/mine',
              })
            } else {
              //登录情况下上传视频
                wx.navigateTo({
                  url: '../VideoInfo/VideoInfo?videoInfo='+me.data.videoInfo,
                })
            }
          } else if (status == 500) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: function(res) {

          wx.hideLoading();
          wx.showToast({
            title: '登录失败了，烧鸡',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }

  },
  goRegistPage: function(e) {
    wx.navigateTo({
      url: '../regist/regist',
    })
  }


})