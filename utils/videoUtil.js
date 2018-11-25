//上传视频
function uploadVideo() {
  //解决作用域问题！
  var me = this;
  //选择视频！！！
  wx.chooseVideo({
    success: function (res) {
      //console.log(res)
      //res.xx都是success返回的数据!!!! 是微信小程序官方提供的！！
      var duration = res.duration;
      var tmpHeight = res.height;
      var tmpWidth = res.width;
      var tmpVideoUrl = res.tempFilePath;
      var tmpCoverUrl = res.thumbTempFilePath;
      //设置视频时长最多不超过11秒
      if (duration > 20) {
        wx.showToast({
          title: '视频太长了！！',
          icon: "none",
          duration: 2000
        })
      } else if (duration <= 2) {
        wx.showToast({
          title: '视频太短啦！！！！',
          icon: "none",
          duration: 2000
        })
      }
      else {
        //跳转到选择bgm！！
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            '&tmpHeight=' + tmpHeight +
            '&tmpWidth=' + tmpWidth +
            '&tmpVideoUrl=' + tmpVideoUrl +
            '&tmpCoverUrl=' + tmpCoverUrl
        })
      }
    }
  })
}
module.exports={
  uploadVideo: uploadVideo
}