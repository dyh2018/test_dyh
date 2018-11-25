const app = getApp()

Page({
  data: {
    //用于分页
    page: 1,
    pageTotal: 1,
    videoList: [],
    serverUrl: "",
    screenWidth: 350,
    videoDesc: ''
  },

  onLoad: function(params) {
    // console.log(params.searchValue+"----------");
    //解决作用域问题
    var me = this;
    var page = me.data.page;
    if (params.searchValue == null || params.searchValue == '' || 
    params.searchValue == undefined) {
      var videoDesc='';
    } else {
      var videoDesc = params.searchValue
    }
    //得到手机系统屏幕宽度（同步）
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
      videoDesc: videoDesc
    });
    me.getAllVideos(page, params.isSaveRecords);
  },
  getAllVideos: function(page, isSaveRecords) {
    var serverUrl = app.serverUrl;
    var me = this;
    if (isSaveRecords == null || isSaveRecords == '' || isSaveRecords == undefined) {
      isSaveRecords = 0;
    }
    //console.log(me.data.videoDesc + "-----------------")
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&isSaveRecords=' + isSaveRecords+'&pagesize='+3,
      method: "POST",
      data: {
        videoDesc: me.data.videoDesc
      },
      success: function(res) {
        //成功的话快速停止下拉刷新
        wx.stopPullDownRefresh();
        console.log(res.data.data.total + '----------');
        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          me.setData({
            videoList: []
          });
        }
        var total = res.data.data.total;
        var videoList = res.data.data.rows;
        var newVideoList = (me.data.videoList).concat(videoList);
        me.setData({
          serverUrl: app.serverUrl,
          pageTotal: total,
          videoList: newVideoList,
          page: res.data.data.page
        })
        // console.log(videoList.length + '-=--------------------------------------' +
        //   total + "-------------" + page
        // )
      }
    })
  },
  //上拉刷新
  onReachBottom: function(res) {
    // console.log(res+"----------");
    var me = this;
    console.log(me.data.pageTotal)
    var pageTotal = me.data.pageTotal;
    var page = me.data.page;
    if (page == pageTotal) {
      wx.showToast({
        title: '口你急哇，没有视频了。。。',
        icon: 'none',
        duration: 2000
      })

    } else {
      //如果还有视频的话，就加1页
      me.getAllVideos(page + 1, 0);
    }
  },
  //下拉刷新
  onPullDownRefresh: function() {
   // console.log("------------------------")
    var me = this;
    me.getAllVideos(1, 0);
  },
  //展示具体的视频信息
  showVideoInfo: function(e) {
    var me=this;
    var arrindex=e.target.dataset.arrindex;
    //wx.redirectTo无法传送json数据，所以转成字符串传送
    var videoInfo = JSON.stringify(me.data.videoList[arrindex]);
    wx.redirectTo({
      url: '../VideoInfo/VideoInfo?videoInfo='+videoInfo,
    })
  }



})