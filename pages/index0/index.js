var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
import { $wuxButton } from '../../components/wux'
var qqmapsdk;
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    searchResults: [],
    isPop: false
  },
  onShow: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
    this.moveToLocation()
    //  this.includePoints()
    var _that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        _that.setData({ //结果更新至data中
          latitude: latitude,
          longitude:longitude
        });
      }
    })

  },
  onLoad: function (options) {
    wx.showModal({
      title: '属性问卷',
      content: '首次登录，请先答一份问卷',
      confirmText: "好",
      cancelText: "不，谢谢",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          wx.navigateTo({
            url: '../ask/ask'
          })
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'P3JBZ-WX36G-3K4QJ-ITACJ-BT42Z-6OBZR'
    });
    // 3.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: 1,
            iconPath: '/assets/image/map/location.png',
            position: {
              left: 20,
              top: res.windowHeight - 120,
              width: 50,
              height: 50
            },
            clickable: true
          },
          {
            id: 3,// 足球
            iconPath: '/assets/image/football.png',
            position: {
              left: res.windowWidth - 70,
              top: 150,
              width: 45,
              height: 45
            },
            clickable: true
          },
          {
            id: 5,// 篮球
            iconPath: '/assets/image/basketball.png',
            position: {
              left: res.windowWidth - 68,
              top: 50,
              width: 45,
              height: 45
            },
            clickable: true
          }]
        })
      }
    });
  },
  bindmarkertap: function (e) {
    this.setData({
      isPop: true
    })
    console.log(e);
  },
  bindcallouttap: function (e) {
    wx.showActionSheet({
      itemList: ['跳转到A页面', '跳转到B页面', '跳转到B页面'],
      success: function (res) {
        console.log(res.tapIndex)
        wx.navigateTo({
          url: '../mappop/mappop'
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
    console.log('气泡跳转')
  },
  // 地图控件点击事件
  bindcontroltap: function (e) {
    // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
    switch (e.controlId) {
      // 点击定位控件
      case 1: this.moveToLocation();
        break;
      // 点击立即用车，判断当前是否正在计费
      case 2: if (this.timer === "" || this.timer === undefined) {
        // 没有在计费就扫码
        wx.scanCode({
          success: (res) => {
            // 正在获取密码通知
            wx.showLoading({
              title: '正在获取密码',
              mask: true
            })
            // 请求服务器获取密码和车号
            wx.request({
              url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/password',
              data: {},
              method: 'GET',
              success: function (res) {
                // 请求密码成功隐藏等待框
                wx.hideLoading();
                // 携带密码和车号跳转到密码页
                wx.redirectTo({
                  url: '../scanresult/index?password=' + res.data.data.password + '&number=' + res.data.data.number,
                  success: function (res) {
                    wx.showToast({
                      title: '获取密码成功',
                      duration: 1000
                    })
                  }
                })
              }
            })
          }
        })
        // 当前已经在计费就回退到计费页
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
        break;
      // 点击保障控件，跳转到报障页
      case 3: wx.navigateTo({
        url: '../warn/index'
      });
        break;
      // 点击头像控件，跳转到个人中心
      case 5: wx.navigateTo({
        url: '../about/about'
      });
        break;
      default: break;
    }
  },
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: 23.10229,
        longitude: 113.3345211,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: 23.10229,
        longitude: 113.3345211,
      }, {
        latitude: 23.00229,
        longitude: 113.3345211,
      }]
    })
  },
  pinMapBySuggest: function (e) {
    console.log('e',e)
    var dataset = e.currentTarget.dataset;
    var location = dataset.location;
    this.setData({ //结果更新至data中
      inputVal:'',
      latitude: location.lat,
      longitude: location.lng,
      searchResults:[],
      markers: [{
        id:new Date().getTime(),
        latitude: location.lat,
        longitude: location.lng,
        iconPath: '/assets/image/location.png',
        callout: {
          content: dataset.title,
          color:'#ffffff',
          padding:10,
          borderRadius:5,
          bgColor:'#1AAD19',
          display:'BYCLICK'
        },
        clickable: true
      }],
      'map.hasMarkers': true//解决方案  
    });
  },
  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      placeData: {
        title: '名称：' + data[i].title + '\n',
        address: '地址：' + data[i].address + '\n',
        telephone: '电话：' + data[i].telephone
      }
    });
  },



  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var _that = this;
    // qqmapsdk.search 地点搜索，搜索周边poi
    // qqmapsdk.getSuggestion 用于获取输入关键字的补完与提示，帮助用户快速输入
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      success: function (res) {
        console.log(res);
        if (res.data.length == 0) { //若无搜索结果则提示用户
          _that.setData({
            searchResults: [{
              title: "暂无此信息",
              address: "请确认后再次输入"
            }]
          });
          return;
        }
        var searchResults = [];
        for (var i = 0; i < res.data.length; i++) {
          var result = res.data[i];
          var title = result.title;
          var address = result.address;
          if (address.length >= 20) {
            address = address.substring(0, 20) + "...";
          }
          var temp = {
            title: title,
            address: address,
            location: result.location
          }

          searchResults.push(temp);
        }
        _that.setData({ //结果更新至data中
          searchResults: searchResults
        });
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
    this.setData({
      inputVal: e.detail.value
    });
  }
});