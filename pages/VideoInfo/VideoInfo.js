// pages/VideoInfo/VideoInfo.js
var videoUtil = require('../../utils/videoUtil.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cover: "cover",
    videoId: "",
    videoInfo: {},
    src: "",
    userLikeVideo: false,
    publisher: {},
    serverUrl: "",
    commentFocus: false,
    contentValue: "",

    commentsList: [],
    commentPage: 1,
    commentTotalPage: 1,

    placeholder: '嘤嘤嘤',
    fatherCommentId: '',
    toUserId: ''


  },
  //video的上下文！！
  videoContext: {},
  onLoad: function(params) {
    console.log(params)
    var me = this;
    var serverUrl = app.serverUrl;
    me.videoContext = wx.createVideoContext("myVideo", me);
    //因为传过来的是字符串所以转换成json格式
    var videoInfo = JSON.parse(params.videoInfo);
    var src = serverUrl + videoInfo.videoPath;
    var videoId = videoInfo.id;
    var videoHeight = videoInfo.videoHeight;
    var videoWidth = videoInfo.videoWidth;
    var cover = '';
    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    //调节横竖屏播放的问题
    if (videoWidth >= videoHeight) {
      cover = ''
    } else {
      cover = 'cover'
    }
    me.setData({
      videoId: videoId,
      src: src,
      videoInfo: videoInfo,
      cover: cover,
      serverUrl: serverUrl,
      //去掉上一次的评论显示
    })
    if (user != null && user != '' && user != undefined) {
      loginUserId = user.id;
    }
    //查询发布者信息和登录者是否喜欢当前发布者所发布的视频
    wx.request({
      url: serverUrl + '/user/queryPublisherInfo?loginUserId=' + loginUserId + '&videoId=' + videoInfo.id + '&publishId=' + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        //console.log(res);
        var data = res.data.data;
        me.setData({
          publisher: data.publisher,
          userLikeVideo: data.usersLikeVideos
        })
      }
    })
    me.getVideoComments(1);

  },
  onShow: function() {
    var me = this;
    //开启播放
    me.videoContext.play()
  },
  onHide: function() {
    var me = this;
    //暂停播放
    me.videoContext.pause()
  },
  showSearch: function() {
    wx.navigateTo({
      url: '../SearchVideo/SearchVideo',
    })
  },
  //上传视频
  upload: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    console.log(user);
    if (user == null || user == '' || user == undefined) {
      //转成字符串
      var videoInfo = JSON.stringify(me.data.videoInfo);
      wx.navigateTo({
        url: '../login/login?videoInfo=' + videoInfo,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },
  //返回主页面
  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  //调转个人信息页面，如未登陆则调转到登陆页面
  showMine: function() {
    var user = app.getGlobalUserInfo();
    //console.log(user);
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  //跳转到视频发布者的信息页面
  showPublisher: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var publisherId = me.data.publisher.id
    //如果未登录的话
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + publisherId
      })
    }
  },
  //喜欢/不喜欢视频
  likeVideoOrNot: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var userLikeVideo = me.data.userLikeVideo;
    var videoInfo = me.data.videoInfo
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      //喜欢
      if (userLikeVideo) {
        wx.showLoading({
          title: '...',
        })
        wx.request({
          url: serverUrl + '/video/userUnLike?videoId=' + videoInfo.id + '&userId=' + user.id + '&videoCreateId=' + videoInfo.userId,
          method: 'POST',
          header: {
            'userId': user.id,
            'userToken': user.userToken
          },
          success: function() {
            wx.hideLoading();
            me.setData({
              userLikeVideo: !userLikeVideo
            })
          }
        })
      }
      //不喜欢
      else {
        wx.showLoading({
          title: '...',
        })
        wx.request({
          url: serverUrl + '/video/userLike?videoId=' + videoInfo.id + '&userId=' + user.id + '&videoCreateId=' + videoInfo.userId,
          method: 'POST',
          header: {
            'userId': user.id,
            'userToken': user.userToken
          },
          success: function() {
            wx.hideLoading();
            me.setData({
              userLikeVideo: !userLikeVideo
            })
          }
        })
      }
    }
  },
  //分享 
  //弹出分享，举报，下载界面
  shareMe: function() {
    var me = this;
    var serverUrl = app.serverUrl;
    var videoInfo = me.data.videoInfo;
    wx.showActionSheet({
      itemList: ['下载视频到本地', '举报该视频', '分享'],
      success: function(res) {
        var tapIndex = res.tapIndex;
        if (tapIndex == 0) {
          //下载视频到本地
          wx.showLoading({
            title: '下载中',
          })
          wx.downloadFile({
            url: serverUrl + videoInfo.videoPath, //仅为示例，并非真实的资源
            success: function(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode == 200) {
                console.log(res.tempFilePath + '---')
                //保存临时文件到用户的系统相册
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function() {
                    wx.hideLoading();
                    wx.showToast({
                      title: '下载完成',
                      duration: 2000,
                      icon: 'none'
                    })
                  }
                })
              }
            }
          })

        } else if (tapIndex == 1) {
          //举报视频
          var user = app.getGlobalUserInfo();
          if (user == null || user == '' || user == undefined) {
            wx.navigateTo({
              url: '../login/login',
            })
          } else {
            var videoId = me.data.videoId;
            var publisherId = me.data.publisher.id;
            wx.navigateTo({
              url: '../Report/Report?videoId=' + videoId + '&publisherId=' + publisherId,
            })
          }
        } else {
          //分享
        }
      }
    })
  },
  //转发
  onShareAppMessage: function() {
    var me = this;
    var videoInfo = JSON.stringify(me.data.videoInfo);
    return "pages/VideoInfo/VideoInfo?videoInfo=" + videoInfo;
  },
  //聚焦评论输入框
  focusComment: function() {
    var me = this;
    me.setData({
      commentFocus: true
    })
  },
  //聚焦回复
  replyFocus: function(e) {
    var me = this;
    //console.log(e+'-------')
    //要小写，传入来的值要全小写字母，dataset之后的全小写
    var fatherCommentId = e.currentTarget.dataset.fathercommentid
    var toUserId = e.currentTarget.dataset.touserid
    var toNickname = e.currentTarget.dataset.tonickname
    var me = this;
    me.setData({
      placeholder: '回复' + toNickname,
      fatherCommentId: fatherCommentId,
      toUserId: toUserId,
      commentFocus: true
    })
  },
  //输入评论并发送
  saveComment: function(e) {
    var me = this;
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var contentValue = e.detail.value;
    var fatherCommentId = me.data.fatherCommentId;
    var toUserId = me.data.toUserId;
    //debugger;
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.request({
        url: serverUrl + '/user/savecomments?fatherCommentId=' + fatherCommentId + 
        '&toUserId=' + toUserId,
        data: {
          videoId: videoInfo.id,
          fromUserId: user.id,
          comment: contentValue
        },
        method: 'POST',
        header: {
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          me.setData({
            contentValue: '',
            commentsList: []
          })
          me.getVideoComments(1);
        }
      })
    }
  },
  //获得视频的评论
  getVideoComments: function(page) {
    var me = this;
    var serverUrl = app.serverUrl;
    var videoInfo = me.data.videoInfo;
    var videoId = videoInfo.id;
    wx.request({
      url: serverUrl + '/video/getvideocomments?videoId=' + videoId + '&page=' + page + '&pagesize=' + 3,
      method: 'POST',
      success: function(res) {
        console.log(res.data);
        var oldCommentsList = me.data.commentsList;
        var commentsList = res.data.data.rows;
        console.log(commentsList + '------' + oldCommentsList);
        var newCommentsList = oldCommentsList.concat(commentsList);
        me.setData({
          commentsList: newCommentsList,
          commentPage: res.data.data.page,
          commentTotalPage: res.data.data.total
        })
      }
    })
  },
  //上拉触底分页加长评论
  onReachBottom: function() {
    var me = this;
    var commentPage = me.data.commentPage;
    var commentTotalPage = me.data.commentTotalPage;
    if (commentPage == commentTotalPage) {
      return;
    }
    me.getVideoComments(commentPage + 1);
  }
})