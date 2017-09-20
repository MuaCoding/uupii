var uupii = angular.module('uupii.services', [])

uupii.factory('HttpFact', function($q, $http, $timeout, $location, $rootScope, PopupFact) {
    function execHttp(httpJson, success, failed) {
        var deferred = $q.defer();
        $http(httpJson).then(function(request) {
            if (typeof success == "function") {
                success(request);
            };
            deferred.resolve(request.data);
        }, function(request) {
            if (typeof failed == "function") {
                failed(request);
            };
            deferred.reject(request.data);
        });
        return deferred.promise;
    }

    var flag = false;

    function loginConfirm(msg) {
        $timeout(function() {
            if (!flag) {
                flag = true;
                PopupFact.clear();
                var confirm = PopupFact.alert("提示", msg, "登录").then(function(res) {
                    if (res) {
                        $rootScope.Jump_login(encodeURIComponent($location.absUrl()))
                    } else {
                        $rootScope.$ionicGoBack();
                    }
                });
                confirm.then(function() {
                    flag = false;
                })
            };
        }, 20)
    }

    return {
        Get: function(url, params) {
            var httpJson = {
                method: "GET",
                url: url,
                params: params
            };
            return execHttp(httpJson);
        },
        Post: function(url, data, params) {
            var httpJson = {
                method: "POST",
                url: url,
                data: data,
                params: params
            };
            return execHttp(httpJson);
        },
        Method: function(method, url, data, params) {
            var httpJson = {
                method: method,
                url: url,
                data: data,
                params: params
            };
            return execHttp(httpJson);
        },
        //带用户信息获取数据（方法，地址，POST参数，URL参数，登录失效提示）
        User: function(method, url, data, params, failureTips) {
            failureTips = failureTips || true;
            if (!whether_login()) {
                var deferred = $q.defer();
                $timeout(function() {
                    deferred.reject({ err_code: 3, err_msg: "请登录后再进行操作" });
                }, 100);
                // if (failureTips) {
                //     loginConfirm("请登录后再进行操作")
                // };
                return deferred.promise;
            };

            var httpJson = {
                method: method,
                url: url,
                data: data,
                params: params,
                headers: { "User-Token": localStorage.getItem("user_token") }
            };

            return execHttp(httpJson, null, function(request) {
                if (failureTips) {return};
                
                var errCode = [51001, 51002, 51003, 51004, 3];
                if (errCode.indexOf(request.data.err_code) >= 0) {
                    loginConfirm("登录状态失效，请重新登录");
                }
                if (failureTips && (request.status == 401 || request.status == 403)) {
                    loginConfirm("登录状态失效，请重新登录");
                    return;
                };
            })
        }
    }
})

// 对话框
uupii.factory('PopupFact', function($ionicPopup) {
    var popupList = [];
    var that = null;
    return that = {
        alert: function(title, msg, okText) {
            var nowPopup = $ionicPopup.alert({
                title: title,
                template: msg,
                okText: okText || "确定"
            });

            nowPopup.then(function() {
                that.hide(nowPopup);
            });

            popupList.push(nowPopup);
            return nowPopup;
        },
        confirm: function(title, msg, okText, cancelText) {
            var nowPopup = $ionicPopup.confirm({
                title: title,
                template: msg,
                okText: okText || "确定",
                cancelText: cancelText || "取消"
            });

            nowPopup.then(function() {
                that.hide(nowPopup);
            });

            popupList.push(nowPopup);
            return nowPopup;
        },
        show: function(data) {
            var nowPopup = $ionicPopup.show(data);

            popupList.push(nowPopup);
            return nowPopup;
        },
        hide: function(popup) {
            try {
                popup.close();
                popupList.splice(popupList.indexOf(popup), 1);
            } catch (e) {}
        },
        clear: function() {
            var tempList = angular.copy(popupList);
            for (var i = 0; i < tempList.length; i++) {
                try {
                    popupList[i].close();
                } catch (e) {}
            };
            popupList = [];
        },
        list: function() {
            return popupList;
        }
    }
})

// modal window
uupii.factory('ModalFact', function($timeout, $ionicPopover, $ionicBody, LoadingFact) {
    var modalList = [],
        that = null;

    return that = {
        init: function(scope, url) {
            var modalPromise = $ionicModal.fromTemplateUrl(url, {
                scope: scope,
                animation: 'slide-in-up',
                hardwareBackButtonClose: false
            });

            modalPromise.then(function(_modal) {
                var modal = {
                    scope: scope,
                    url: url,
                    promise: modalPromise,
                    modal: _modal
                };
                modalList.push(modal);
            });
            return modalPromise;
        },
        show: function(scope, url) {
            LoadingFact.show();
            for (var i in modalList) {
                var modal = modalList[i];
                if (modal.scope == scope && modal.url == url) {
                    modal.promise.then(function(_modal) {
                        LoadingFact.hide();
                        _modal.show();
                    });
                    return modal.promise;
                };
            };
            var modalPromise = this.init(scope, url);
            modalPromise.then(function(_modal) {
                LoadingFact.hide();
                _modal.show();
            });
            return modalPromise;
        },
        hide: function(modal) {
            $timeout(function() {
                try {
                    modal.hide();
                    $ionicBody.removeClass('modal-open');
                } catch (e) {}
            }, 20)
        },
        clear: function() {
            for (var i = 0; i < modalList.length; i++) {
                try {
                    that.hide(modalList[i].modal);
                    modalList[i].modal.remove();
                } catch (e) {}
            };
            modalList = [];
        },
        shown: function() {
            for (var i = (modalList.length - 1); i >= 0; i--) {
                try {
                    if (modalList[i].modal.isShown()) { return modalList[i].modal; };
                } catch (e) {}
            };
            return null;
        }
    }
})

// 弹出框
uupii.factory('PopoverFact', function($timeout, $ionicPopover, $ionicBody, LoadingFact) {
    var popoverList = [],
        that = null;
    return that = {
        init: function(scope, url) {
            var popoverPromise = $ionicPopover.fromTemplateUrl(url, {
                scope: scope,
                hardwareBackButtonClose: false
            });

            popoverPromise.then(function(_popover) {
                var popover = {
                    scope: scope,
                    url: url,
                    promise: popoverPromise,
                    popover: _popover
                };
                popoverList.push(popover);
            });
            return popoverPromise;
        },
        show: function(scope, url) {
            LoadingFact.show();
            for (var i in popoverList) {
                var popover = popoverList[i];
                if (popover.scope == scope && popover.url == url) {
                    popover.promise.then(function(_popover) {
                        LoadingFact.hide();
                        _popover.show();
                    });
                    return popover.promise;
                };
            };
            var popoverPromise = this.init(scope, url);
            popoverPromise.then(function(_popover) {
                LoadingFact.hide();
                _popover.show();
            });
            return popoverPromise;
        },
        hide: function(popover) {
            $timeout(function() {
                try {
                    popover.hide();
                    $ionicBody.removeClass('popover-open');
                } catch (e) {}
            }, 20);
        },
        clear: function() {
            for (var i = 0; i < popoverList.length; i++) {
                try {
                    that.hide(popoverList[i].popover);
                    popoverList[i].popover.remove();
                } catch (e) {}
            };
            popoverList = [];
        },
        shown: function() {
            for (var i = (popoverList.length - 1); i >= 0; i--) {
                try {
                    if (popoverList[i].popover.isShown()) { return popoverList[i].popover; };
                } catch (e) {}
            };
            return null;
        }
    }
})

// loading  
uupii.factory('LoadingFact', function($ionicLoading) {
    var flag = false;
    return {
        show: function(h, n) {
            if (h) {
                flag = true;
            }
            $ionicLoading.show({
                template: '<ion-spinner class="myLoading"></ion-spinner>',
                hideOnStateChange: true,
                delay: n ? 5 : 180
            })
        },
        hide: function(h) {
            if (flag) {
                if (h) {
                    flag = false;
                    $ionicLoading.hide();
                };
            } else {
                $ionicLoading.hide();
            };
        }
    }
})

//提示文字框
uupii.factory('errorServices', function($ionicLoading, $timeout) {
    return {
        show: function(text, time) {
            $ionicLoading.show({
                template: text,
                hideOnStateChange: true,
                delay: 100,
                duration: time == undefined ? 2000 : time,
            });
        },
        hide: function() {
            $ionicLoading.hide();
        },
    }
})

//获取地址栏带过来的指定参数
uupii.factory('getUrlFact', function() {
    return {
        get: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }
    };
});

// query take page data list 

uupii.factory('ListFact', function(HttpFact) {
    return function (_init) {

        //判断初始化时，是否带有数据地址
        if (!_init.hasOwnProperty("url")) {
            throw "no url";
        }
        
        var _this = {
            //取数据地址
            url: _init.url,
            //取数据参数
            parameter: _init.parameter || {},
            //是否需要带上用户信息
            user: _init.user || false,
            //数据量
            count: 0,
            //总页数
            page: 0,
            //单页大小
            size: _init.size || 6,
            //单页大小
            rows: _init.size || 6,
            //当前页码
            current: 1,
            //还有下一页?
            loaded: false,
            //获取数据method
            method: _init.method || false,
            //获取数据类型
            type: _init.type || false,
            //列表加载提示
            tips: _init.tips || "正在加载中...",
            //无数据提示
            nodata: _init.nodata || "没有相关数据",
            //没有更多了提示
            nomore: _init.nomore || "没有更多了",
            //往前插入数据
            unshift: false,
            //得到的数据
            data: [],
            //重新读取(初始化)[成功后执行的函数，失败后执行的函数]
            reset: function() {
                this.current = 1;
                this.loaded = false;
                this.tips = _init.tips || "正在加载中...";
                this.data = [];

                return this.show();
            },
            //读取数据
            show: function() {
                //带上页大小和当前页前往获取数据
                switch(_init.type){
                    case "hot":
                        _this.parameter.rows = _this.size;
                        break;
                    default:
                        _this.parameter.size = _this.size;
                        
                }
                _this.parameter.page = _this.current;

                function dfSuccess(data) {
                    if (data) {
                        _this.count = data.Count;
                        _this.page = data.Page;

                        var dataList = data.List;
                        if (_this.unshift) {
                            dataList = dataList.reverse();
                        }

                        if (_this.current == 1) {
                            _this.data = dataList;
                        } else {
                            _this.data = _this.unshift ? dataList.concat(_this.data) : _this.data.concat(dataList);
                        }

                        //当前页小于总页数，可继续读取
                        if (_this.current < _this.page) {
                            _this.loaded = true;
                        } else {
                            _this.tips = _this.nomore;
                            _this.loaded = false;
                        }
                    } else {
                        dfFailed({ err_code: 0, err_msg: _this.nodata });
                    }

                    return data;
                }

                function dfFailed(data) {
                    _this.current = 1;
                    _this.loaded = false;
                    _this.data = [];
                    if (data.err_msg) {
                        var errCode = data.err_code;
                        var errMsg = data.err_msg;

                        if (errCode == 0)
                            _this.tips = _this.nodata;
                        else
                            _this.tips = errMsg;
                    } else {
                        _this.tips = "未知错误";
                    }

                    return data;
                }

                var dataPromise = null;

                if (_this.user) {
                    if (_this.method) {
                        dataPromise = HttpFact.User("POST", _this.url, _this.parameter, {});
                    }else{
                        dataPromise = HttpFact.User("GET", _this.url, {}, _this.parameter);
                    };
                } else {
                    dataPromise = HttpFact.Get(_this.url, _this.parameter);
                }

                dataPromise.then(function(data) {
                    dfSuccess(data);
                }, function(data) {
                    dfFailed(data);
                });
                return dataPromise;
            },
            //读取下一页
            next: function() {
                if (_this.current < _this.page) {
                    _this.current += 1;

                    return _this.show();
                } else {
                    this.loaded = false;
                    this.tips = _this.nomore;

                    return null;
                }
            }
        };
        return _this;
    };
});