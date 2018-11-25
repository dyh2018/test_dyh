const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: '',
    videoObejct: {}
  },
  onLoad: function(params) {
    console.log(params)
    var me = this;
    me.setData({
      videoObejct: params
    })
    var serverUrl = app.serverUrl;
    // fixme 修改原有的全局对象为本地缓存
    var user=app.getGlobalUserInfo();
    console.log(user.id+"11111111111111111111111");
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        //console.log(res.data);
        var bgmList = res.data.data;
        me.setData({
          bgmList: bgmList,
          serverUrl: serverUrl
        })
      }
    })
  },
  upload: function(e) {
    var serverUrl = app.serverUrl;
    var me = this;
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    console.log(e);
    var duration = me.data.videoObejct.duration;
    var tmpHeight = me.data.videoObejct.tmpHeight;
    var tmpWidth = me.data.videoObejct.tmpWidth;
    var tmpVideoUrl = me.data.videoObejct.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoObejct.tmpCoverUrl;
    console.log(me.data.videoObejct.tmpVideoUrl);
    wx.showLoading({
      title: '等待一下',
    })
    // fixme 修改原有的全局对象为本地缓存
    var user = app.getGlobalUserInfo();
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId:user.id,//app.userInfo.id,
        bgmId: bgmId,
        videoSeconds: duration,
        videoWidth: tmpWidth,
        videoHeight: tmpHeight,
        desc: desc
      },
      header:{
        'userId':user.id,
        'userToken':user.userToken
      },
      filePath: tmpVideoUrl,
      name: 'file',
      success: function(res) {
        wx.hideLoading();
        wx.navigateBack({
          delta: 1,
        })
        wx.showToast({
          title: '上传成功',
        })
      }
    })
  }
})