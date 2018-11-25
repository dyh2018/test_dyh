var videoUtil = require('../../utils/videoUtil.js')
const app = getApp()
Page({
  data: {
    serverUrl: '',
    faceUrl: "../resource/images/noneface.png",
    fansCounts: 0,
    followCounts: 0,
    receiveLikeCounts: 0,
    userId: '',
    nickname: '',
    //上传视频者Id
    publisherId: '',
    //是否是本人
    isMe: true,
    //是否已经是粉丝了
    isFans: false,
    //tab的展示
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myWorkFalg: false,
    myCollectFalg: true,
    myFollowFalg: true,

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    collectVideoList: [],
    collectVideoPage: 1,
    collectVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1
  },
  onLoad: function(params) {
    //解决作用域问题
    var me = this
    me.setData({
      serverUrl: app.serverUrl
    })
    // console.log(me.data.isFans + "-----------33333333333333")
    //用户全局信息赋值，在login.js中登录成功有给app.getGlobalUserInfo()赋值过一次
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    if (params.publisherId != null && params.publisherId != '' && params.publisherId != undefined) {
      userId = params.publisherId;
      me.setData({
        publisherId: params.publisherId,
        isMe: false
      })
    }
    //如果自己点进自己的视频里面点击头像看个人信息，这时候也应该弹出是自己的个人信息
    if (params.publisherId == user.id) {
      me.setData({
        isMe: true
      })
    }
    //专属于本页的userId,可能是登录者也可能是上传视频者Id
    me.setData({
      userId: userId
    })
    var serverUrl = app.serverUrl;
    wx.request({
      //根据id查找用户信息
      //userId可能是视频发布者的id(从点击头像看个人信息处跳转过来的)，也可能是登录者的id
      url: serverUrl + "/user/query?userId=" + userId + '&fansId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken,
      },
      success: function(res) {
        // debugger;
        wx.hideLoading();
        //注意取值规范
        var data = res.data;
        console.log(data);
        if (data.status == 200) {
          var userInfo = data.data;
          var faceUrl = "../resource/images/noneface.png"
          //设定用户未设置头像时的判定条件
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            //注意正确的图片路径的拼接，记得加serverUrl
            //保存在数据库中的只是一部分--faceImage,相对路径，
            faceUrl = serverUrl + userInfo.faceImage;
          }
          //console.log(userInfo);
          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFans: userInfo.isFans
          })
        } else if (data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2500
          })
        }
      }
    })
    //一登录进去就展示一下页面的视频列表
    me.getAllVideoList(1);
  },
  //点击关注或者取消关注
  //并且采取上述行动后更新页面数据
  followMe: function(e) {
    //console.log(e);
    var me = this;
    var followType = e.currentTarget.dataset.followtype;
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var publisherId = me.data.publisherId;
    var url = "";
    //未登录
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../login/login',
      })
    }
    // 1：关注 0：不关注
    if (followType == '1') {
      url = serverUrl + '/user/beyourfans?userId=' + publisherId + '&fansId=' +
        user.id
    } else {
      url = serverUrl + '/user/notbeyourfans?userId=' + publisherId + '&fansId=' +
        user.id
    }
    wx.showLoading({
      title: '...',
    })
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        if (res.data.status == 200) {
          wx.showToast({
            title: '关注成功',
          })
          if (followType == '1') {
            me.setData({
              isFans: true
            })
            //console.log(me.data.isFans);
          } else {
            me.setData({
              isFans: false
            })
          }
          //当关注关系发生变化时更新页面数据
          //debugger;
          wx.request({
            //要加个fansId,不加的话都传不过去
            url: serverUrl + '/user/query?userId=' + publisherId + '&fansId=' + '',
            method: 'POST',
            header: {
              'userId': user.id,
              'userToken': user.userToken
            },
            success: function(res) {
              me.setData({
                fansCounts: res.data.data.fansCounts
              })
            }
          })
        } else if (res.data.status == 500) {
          wx.showToast({
            title: res.data.msg,
          })
        }
      }
    })
  },
  //注销
  logout: function() {
    //获得全局对象
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待',
    })
    //这里的userId要和后端的userId保持一致才可以正确传递数据，否则为空！！！！！！
    wx.request({
      url: serverUrl + "/logout?userId=" + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 200) {
          //让用户的全局对象信息为空，因为已经成功注销了
          // app.userInfo = null;
          wx.removeStorageSync("userInfo")
          wx.showToast({
            title: '注销成功',
            icon: "success",
            duration: 2000
          })
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  //上传头像
  changeFace: function(res) {
    //解决作用域问题！
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        wx.showLoading({
          title: '上传中',
        })
        var serverUrl = app.serverUrl;
        var user = app.getGlobalUserInfo();
        var userId = user.id;
        console.log(userId);
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userId,
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'userId': user.id,
            'userToken': user.userToken
          },
          success: function(res) {
            wx.hideLoading();
            //因为该函数返回的不是JSON格式的数据所以要转换！！！
            var data = JSON.parse(res.data);
            console.log(data);
            if (data.status == 200) {
              wx.showToast({
                  title: '上传成功',
                  icon: "success"
                }),
                me.setData({
                  faceUrl: serverUrl + data.data
                })
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg,
              })
            }
          }
        })
      },
    })
  },
  //上传视频
  uploadVideo: function() {
    //使用公共Utils来写
    //videoUtil.uploadVideo();
    //解决作用域问题！
    var me = this;
    //选择视频！！！
    wx.chooseVideo({
      success: function(res) {
        //console.log(res)
        //res.xx都是success返回的数据!!!! 是微信小程序官方提供的！！
        var duration = res.duration;
        var tmpHeight = res.height;
        var tmpWidth = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var tmpCoverUrl = res.thumbTempFilePath;
        //设置视频时长最多不超过11秒
        // if (duration > 20) {
        //   wx.showToast({
        //     title: '视频太长了！！',
        //     icon: "none",
        //     duration: 2000
        //   })
        // } else if (duration <= 2) {
        //   wx.showToast({
        //     title: '视频太短啦！！！！',
        //     icon: "none",
        //     duration: 2000
        //   })
        // } else {
          //跳转到选择bgm！！
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              '&tmpHeight=' + tmpHeight +
              '&tmpWidth=' + tmpWidth +
              '&tmpVideoUrl=' + tmpVideoUrl +
              '&tmpCoverUrl=' + tmpCoverUrl
          })
        //}
      }
    })
  },
  //tab的动态展示(作品，收藏，关注)
  //作品
  doSelectWork: function() {
    var me = this;
    me.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",
      myWorkFalg: false,
      myCollectFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      collectVideoList: [],
      collectVideoPage: 1,
      collectVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    })
    me.getAllVideoList(1);
  },
  //得到所有是个人信息页面的人的视频
  getAllVideoList: function(page) {
    var me = this;
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    wx.request({
      url: serverUrl + '/video/showAll?isSaveRecords=' + 0 + '&page=' + page + '&pagesize=' + 6,
      method: 'POST',
      data: {
        userId: me.data.userId
      },
      success: function(res) {
        console.log("getAllVideoList");
        console.log(res);
        var oldVideoList = me.data.myVideoList;
        var myVideoList = res.data.data.rows;
        var myVideoPage = res.data.data.page;
        var myVideoTotal = res.data.data.total;
        //要拼接上已经读取过的视频，不然就无法看到整个列表了！！
        var newVideoList = oldVideoList.concat(myVideoList)
        me.setData({
          myVideoList: newVideoList,
          myVideoPage: myVideoPage,
          myVideoTotal: myVideoTotal
        })
      }
    })
  },
  //收藏
  doSelectLike: function() {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",
      myWorkFalg: true,
      myCollectFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      collectVideoList: [],
      collectVideoPage: 1,
      collectVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    })
    me.getCollectVideoList(1);
  },
  //得到所有用户收藏的视频列表！！
  getCollectVideoList: function(page) {
    var me = this;
    var serverUrl = app.serverUrl;
    var userId = me.data.userId;
    wx.request({
      url: serverUrl + '/video/showmycollectvideos?userId=' + userId + '&pagesize=' + 
      6 +'&page=' + page,
      method: 'POST',
      success:function(res){
        console.log(res);
        var oldVideoList = me.data.collectVideoList;
        var collectVideoList = res.data.data.rows;
        var collectVideoPage = res.data.data.page;
        var collectVideoTotal = res.data.data.total;
        var newVideoList=oldVideoList.concat(collectVideoList)
        me.setData({
          collectVideoList: newVideoList,
          collectVideoPage: collectVideoPage,
          collectVideoTotal: collectVideoTotal
        })
      }
    })
  },
  //关注
  doSelectFollow: function() {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",
      myWorkFalg: true,
      myCollectFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      collectVideoList: [],
      collectVideoPage: 1,
      collectVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    })
    me.getFollowVideoList(1);
  },
  getFollowVideoList:function(page){
    var me=this;
    var serverUrl=app.serverUrl;
    var userId=me.data.userId
    wx.request({
      url: serverUrl +'/video/showmyfollowvideos?userId='+userId+'&page='+page+'&pagesize='+6,
      method:'POST',
      success:function(res){
        var data=res.data.data;
        console.log(data);
        var oldVideoList=me.data.followVideoList;
        var followVideoPage=data.page;
        var followVideoTotal=data.total;
        var newVideoList=oldVideoList.concat(data.rows);
        me.setData({
          followVideoList:newVideoList,
          followVideoPage: followVideoPage,
          followVideoTotal: followVideoTotal
        })
      }
    })


  },
  //展示视频
  showVideo: function(e) {
    var me = this;
    var arrindex = e.currentTarget.dataset.arrindex;
    var myWorkFalg = me.data.myWorkFalg;
    var myCollectFalg = me.data.myCollectFalg;
    var myFollowFalg = me.data.myFollowFalg;
    if (!myWorkFalg) {
      var myVideoList = me.data.myVideoList;
      //转成字符串才能传
      var videoInfo = JSON.stringify(myVideoList[arrindex]);
      wx.navigateTo({
        url: '../VideoInfo/VideoInfo?videoInfo=' + videoInfo,
      })
    }
    if(!myCollectFalg){
      var collectVideoList = me.data.collectVideoList;
      var videoInfo=JSON.stringify(collectVideoList[arrindex])
      wx.navigateTo({
        url: '../VideoInfo/VideoInfo?videoInfo='+videoInfo,
      })
    }
    if(!myFollowFalg){
      var followVideoList = me.data.followVideoList;
      var videoInfo=JSON.stringify(followVideoList[arrindex])
      wx.navigateTo({
        url: '../VideoInfo/VideoInfo?videoInfo='+videoInfo,
      })
    }
  },
  //下拉触底刷新
  onReachBottom: function() {
    var me = this;
    var myWorkFalg = me.data.myWorkFalg;
    var myCollectFalg = me.data.myCollectFalg;
    var myFollowFalg = me.data.myFollowFalg;
    if (!myWorkFalg) {
      var myVideoPage = me.data.myVideoPage;
      var myVideoTotal = me.data.myVideoTotal;
      if (myVideoPage == myVideoTotal) {
        wx.showToast({
          title: '没有视频啦',
        })
      } else {
        me.getAllVideoList(myVideoPage + 1);
      }
    }
    if(!myCollectFalg){
      var collectVideoPage = me.data.collectVideoPage;
      var collectVideoTotal = me.data.collectVideoTotal;
      if(collectVideoPage==collectVideoTotal){
        wx.showToast({
          title: '没有视频啦',
        })
      }
      else{
        me.getCollectVideoList(collectVideoPage+1);
      }
    }
    if(!myFollowFalg){
      var followVideoPage = me.data.followVideoPage;
      var followVideoTotal = me.data.followVideoTotal;
      if(followVideoPage==followVideoTotal){
        wx.showToast({
          title: '没有视频啦',
        })
      }
      else{
        me.getFollowVideoList(followVideoPage+1);
      }
    }
  }
})