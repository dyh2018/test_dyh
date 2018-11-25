const app = getApp()

Page({
  data: {
    reasonType: "请选择原因",
    reportReasonArray: app.reportReasonArray,
    publisherId: "",
    videoId: ""
  },
  onLoad: function(params) {
    //console.log(params)
    var me = this;
    var publisherId = params.publisherId;
    var videoId = params.videoId;
    me.setData({
      publisherId: publisherId,
      videoId: videoId
    })
  },
  changeMe: function(e) {
    var me = this;
    var index = e.detail.value;
    var reportReasonArray = me.data.reportReasonArray;
    var reasonType = reportReasonArray[index];
    me.setData({
      reasonType: reasonType
    })
  },
  submitReport: function(e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var reasonType = me.data.reasonType;
    if (reasonType == '请选择原因' || reasonType == '') {
      wx.showToast({
        title: '举报理由必选',
        icon: 'none',
        duration: 2000
      })
      return;
    } else {
      //console.log(e.detail.value);
      var reportReasonArray = me.data.reportReasonArray;
      var index = e.detail.value.reasonIndex;
      var content = e.detail.value.reasonContent;
     // console.log(reportReasonArray[index]+'---');
      var title = reportReasonArray[index];
      var dealUserId = me.data.publisherId;
      var dealVideoId = me.data.videoId;
      wx.request({
        url: serverUrl + '/user/reportuser',
        method:'POST',
        data: {
          content: content,
          title: title,
          dealUserId: dealUserId,
          dealVideoId: dealVideoId,
          userid:user.id
        },
        header: {
          'userId': user.id,
          'userToken': user.userToken
        },
        success:function(res){
          if(res.data.status==200){
             wx.navigateBack({
               delta:1,
               success:function(){
                 wx.showToast({
                   title: '举报成功',
                   duration:2000
                 })
               }
             })
          }
          else{
            wx.showToast({
              title: res.data.msg,
            })
          }
        }      
      })
    }

  }

})