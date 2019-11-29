var amapFile = require('../../libs/amap-wx.js');  //引入高德js
var config = require('../../libs/config.js');      //引用我们的配置文件
Page({
  data: {
    markers: [
      {
        iconPath: "../../images/mapicon_navi_s.png",
        id: 0,
        latitude: '',
        longitude: '',
        width: 23,
        height: 33
      }, {
        iconPath: "../../images/mapicon_navi_e.png",
        id: 0,
        latitude: '',
        longitude: '',
        width: 24,
        height: 34
      }
    ],
    centerLongitude: '110.917969',
    centerLatitude: '33.504759',
    scale: 5,
    distance: '0',
    cost: '',
    polyline: [],
    button: true,
    originValue: '',
    endValue: '',
    key: '',
    origin: '',
    destination: '',
    isOrigin: true
  },
  onLoad: function () {

  },
  originValue(e) {
    this.setData({
      originValue: e.detail.value
    })
  },
  endValue(e) {
    this.setData({
      endValue: e.detail.value
    })
  },
  goRoutes: function () {
    if (this.data.originValue && this.endValue){
      var that = this;
      this.data.key = config.Config.webkey;
      var myAmapFun = new amapFile.AMapWX({ key: this.data.key });
      this.getGeo(this.data.originValue)
      this.getGeo(this.data.endValue)
    } else {
      wx.showToast({
        title: '请输入地址',
        icon: 'none'
      })
    }
    
    /* myAmapFun.getDrivingRoute({
     
      success: function (data) {
        console.log(data)
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          that.setData({
            distance: data.paths[0].distance + '米'
          });
        }
        if (data.taxi_cost) {
          that.setData({
            cost: '打车约' + parseInt(data.taxi_cost) + '元'
          });
        }

      },
      fail: function (info) {

      }
    }) */
  },
  getGeo: function (value) {
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/geo',
      data: {
        address: value,
        key: this.data.key
      },
      method: 'get',
      dataType: 'json',
      responseType: 'text',
      success: (res) => {
        console.log(res)
        if (this.data.isOrigin) {
          this.data.origin = res.data.geocodes[0].location
          this.data.isOrigin = !this.data.isOrigin
        } else {
          this.data.destination = res.data.geocodes[0].location
          this.data.isOrigin = !this.data.isOrigin
          wx.request({
            url: 'https://restapi.amap.com/v3/direction/driving',
            data: {
              origin: this.data.origin,
              destination: this.data.destination,
              key: this.data.key
            },
            method: 'get',
            dataType: 'json',
            responseType: 'text',
            success: (res) => {
              var data = res.data
              if (data.status === '1') {
                var points = [];
                console.log(data)
                if (data.route.paths.length > 0) {
                  var steps = data.route.paths[0].steps;
                  for (var i = 0; i < steps.length; i++) {
                    var poLen = steps[i].polyline.split(';');
                    for (var j = 0; j < poLen.length; j++) {
                      points.push({
                        longitude: parseFloat(poLen[j].split(',')[0]),
                        latitude: parseFloat(poLen[j].split(',')[1])
                      })
                    }
                  }
                }
                this.setData({
                  polyline: [{
                    points: points,
                    color: "#0091ff",
                    width: 6
                  }],
                  markers: [
                    {
                      iconPath: "../../images/mapicon_navi_s.png",
                      latitude: this.data.origin.split(',')[1],
                      longitude: this.data.origin.split(',')[0],
                      width: 23,
                      height: 33
                    }, {
                      iconPath: "../../images/mapicon_navi_e.png",
                      latitude: this.data.destination.split(',')[1],
                      longitude: this.data.destination.split(',')[0],
                      width: 23,
                      height: 33
                    }
                  ],
                  centerLatitude: ((parseFloat(this.data.origin.split(',')[1]) + parseFloat(this.data.destination.split(',')[1])) / 2).toString(),
                  centerLongitude: ((parseFloat(this.data.origin.split(',')[0]) + parseFloat(this.data.destination.split(',')[0])) / 2).toString()
                });
                if (data.route.paths[0] && data.route.paths[0].distance) {
                  const distance = (data.route.paths[0].distance / 1000).toFixed(2)
                  console.log()
                  if (0 < distance && distance <= 10) {
                    this.setData({
                      scale: '13'
                    })
                  } else if (10 < distance && distance <= 30) {
                    this.setData({
                      scale: '12'
                    })
                  } else if (30 < distance && distance <= 50) {
                    this.setData({
                      scale: '11'
                    })
                  } else if (50 < distance && distance <= 100) {
                    this.setData({
                      scale: '10'
                    })
                  } else if (100 < distance && distance <= 200) {
                    this.setData({
                      scale: '9'
                    })
                  } else if (200 < distance && distance <= 500) {
                    this.setData({
                      scale: '7'
                    })
                  } else if (500 < distance && distance <= 1000) {
                    this.setData({
                      scale: '6'
                    })
                  }
                  this.setData({
                    distance: distance
                  });
                }
              } else {
                wx.showToast({
                  title: '您输入的地址不能到达，请重新输入',
                  icon: 'none'
                })
              }
              
            },
          })
        }

      }
    })
  }
})