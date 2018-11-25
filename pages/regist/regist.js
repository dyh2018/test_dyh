const app = getApp()
Page({
    data: {
    },
  doRegist:function(e){
      var formObeject=e.detail.value;
      var username=formObeject.username;
      var password=formObeject.password;

      if(username.length==0||password.length==0){
        wx.showToast({
          title:"用户名或密码不能为空",
          icon:'none',
          duration:2000
        })
      }
      else{
        var serverUrl=app.serverUrl;
        //展示等待
        wx.showLoading({
          title: '请耐心等待',
        })
        wx.request({
          url: serverUrl+'/regist',
          method:"POST",
          data:{
            username:username,
            password:password,
          },
          header:{
            'content-type':'application/json'
          },
          success:function(response){
              console.log(response.data);
              var status=response.data.status;
              if(status==200){
                //隐藏等待框
                wx.hideLoading();
                wx.showToast({
                  title: '注册成功',
                  icon: 'none',
                  duration: 2000
                }),
                //保存数据进全局对象
               // app.userInfo=response.data.data;
                app.setGlobalUserInfo(response.data.data)
                wx.navigateTo({
                  url: '../mine/mine',
                })
              }
              else if(status==500){
                wx.hideLoading();
                wx.showToast({
                  title: response.data.msg,
                  icon:'none',
                  duration:2000
                })
              }
          }
        })
      }
  } 
})