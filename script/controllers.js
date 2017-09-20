var uupii = angular.module('uupii.controllers', []);

// index page
uupii.controller("indexCtrl", function ($q, $scope, $state, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, ListFact, PopupFact, ModalFact) {
    $scope.input = {};
    $scope.flag = false;
    $scope.paging = "正在加载中...";
    // query banners data
    function queryBanners() {
        return HttpFact.User("POST", apiDomain + "/Art/getBanner", { "count": 4 }, {}).then(
            function(data) {
                if (data) {
                    $timeout(function() {
                        var slider = $ionicSlideBoxDelegate.$getByHandle("slider");

                        if (data.length <= 2)
                            slider.loop(false);
                        else
                            slider.loop(true);

                        if (data.length <= 1)
                            slider.enableSlide(false);
                        else
                            slider.enableSlide(true);

                        slider.update();
                    }, 20);
                }
                $scope.banners = data;
            },
            function(data) {
                $scope.banners = null;
                var errMsg = data.err_msg || "未知错误";
                PopupFact.alert("错误", errMsg);
            }
        );
    }

    // query new carousel data 
    function queryCarousel() {
        return HttpFact.User("POST", apiDomain + "/Product/getProductList", { "page": 1, "rows": 4, "timeSort": 1 }, {}).then(
            function(data) {
                $scope.flag = true;
                $scope.paging = "加载完成";
                $scope.carousels = data;
                $timeout(function() {
                    $ionicSlideBoxDelegate.update();
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $ionicScrollDelegate.$getByHandle("generalScroll").resize();
                }, 20);
            },
            function(data) {
                $scope.flag = false;
                $scope.paging = "暂无数据";
                $scope.carousels = [];
            }
        );
    }
    // query province and city
    function queryProvince(){
        return HttpFact.User("GET", apiDomain + "/user/get_UserFixationAddress").then(
            function(data) {
                $scope.province = data[0];
            },
            function(data){
                $scope.province = [];
            }
        );
    }
    // query hot data
    var hot = ListFact({user: true, url: apiDomain + "/Product/getProductList", parameter: { "saleSort": 1}, method: true, type: "hot"});
    $scope.hots = hot;
    // loading more
    $scope.loadMore = function(){
        if (hot.loaded) {
            hot.next();
        }
    };

    $scope.refresh = function () {
        $q.all([queryBanners(), queryCarousel(),hot.reset(),queryProvince()]).then(function () {
          //更新Scroll
          $ionicScrollDelegate.resize();
          //告诉IONIC框架，刷新完毕
          $scope.$broadcast("scroll.refreshComplete");
        })
    }

    // ngrepeat finish event
    $scope.hotFinish = function(handle) {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $ionicScrollDelegate.$getByHandle(handle).resize();
    };

    $scope.$on("$ionicView.loaded", function(event, view) {
        $scope.refresh();
    });
});
// product list page
uupii.controller("classifyCtrl", function($scope, $stateParams, HttpFact) {
    $scope.$on("$ionicView.loaded", function(event, view) {});
});
// product detail page
uupii.controller("newsCtrl", function($scope, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, PopupFact, ModalFact) {

});
// product detail page
uupii.controller("ordersCtrl", function($scope, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, PopupFact, ModalFact) {
    // directive data commit controller 
    $scope.$on("paramsSelected", function(event, type, params) {
        $scope.directOrder(type, params);
    });
    // promtyly buy
    $scope.directOrder = function(type, params) {
        var localCart = [{ "id": parseInt($stateParams.id), "amount": 1, "custom": (type === "custom" ? true : false), "params": params }]
        localStorage.setItem("localCart", angular.toJson(localCart));
        $scope.$ionicGoForward("settle");
    };
    // view params
    var parameterModal = null;
    $scope.showParams = function() {
        ModalFact.show($scope, "parameter.html").then(function(modal) {
            parameterModal = modal;
        });
    };
    // back top
    $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop(true);
    }
    $scope.$on("$ionicView.loaded", function(event, view) {

    });
});

// user page
uupii.controller("userCtrl", function() {});

// login page 
uupii.controller("loginCtrl", function($scope, $state, $rootScope, $timeout, HttpFact, PopupFact, LoadingFact, getUrlFact, errorServices) {
    $scope.input = {
        fingerprint: new Fingerprint().get() //获取游览器指纹
    };
    $scope.flag = false;

    // query code 
    $scope.query_code = function() {
        return HttpFact.Get(apiDomain + "/User/getCode").then(
            function(data) {
                $scope.smscode = data;
                $scope.input.codeId = data.res_id;
            },
            function(data) {
                var errMsg = data.err_msg || "未知错误";
                PopupFact.alert("错误", errMsg);
            }
        );
    };

    // submit form 
    $scope.ajaxForm = function() {
        if ($scope.flag) { return false; }
        $scope.flag = true;
        var tplForm = angular.copy($scope.input);
        return HttpFact.Post(apiDomain + "/User/login", tplForm).then(
            function(data) {
                $scope.flag = false;
                switch (data.res_code) {
                    case -1:
                        PopupFact.alert("错误", "缺少参数").then(function() {
                            $scope.query_code();
                        });
                        break;
                    case -2:
                        PopupFact.alert("错误", "密码错误").then(function() {
                            $scope.query_code();
                        });
                        break;
                    case -3:
                        PopupFact.alert("错误", "您的账号违反规定，已被禁用，请联系工作人员!").then(function() {
                            $scope.query_code();
                        });
                        break;
                    case -4:
                        PopupFact.alert("错误", "您输入的验证码有误").then(function() {
                            $scope.query_code();
                        });
                        break;
                    case 1:
                        localStorage.clear();
                        localStorage.setItem("user_token", data.res_token);
                        errorServices.show("登录成功,正在为您跳转...", 1500);
                        var url = getUrlFact.get("url");
                        if (url != null) {
                            location.replace(url);
                        }else{
                            $timeout(function() {
                                location.replace("/");
                            }, 1500);
                        };
                        
                        break;
                }
            },
            function(data) {
                var errMsg = data.err_msg || "未知错误";
                PopupFact.alert("错误", errMsg).then(function() {
                    $scope.flag = false;
                    $scope.query_code();
                });
            }
        );

    };
    // form prompt 
    $scope.prompt = function(form) {
        if (form.pwd.$dirty && form.pwd.$invalid) {
            return "密码输入有误";
        }
        if ($scope.flag) {
            return "正在处理...";
        } else {
            return "登录";
        }
    };

    $scope.wx_login = function() {
        errorServices.show("登录成功,正在为您跳转...", 1500);
    };

    $scope.$on("$ionicView.loaded", function(event, view) {
        $scope.query_code();
    });
});

// product detail
uupii.controller("product.detailCtrl", function($q, $scope, $state, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, ListFact, PopupFact, ModalFact){
    $scope.input = {};
    // query product detail
    function queryDetail() {
        return HttpFact.User("GET", apiDomain + "/Product/getProductDetail",{}, { "id": $stateParams.id }, {}).then(
            function(data) {
                if (data) {
                    var photo = data[0].Pic.split(',');
                    $timeout(function() {
                        var slider = $ionicSlideBoxDelegate.$getByHandle("carousel");

                        if (photo.length <= 2)
                            slider.loop(false);
                        else
                            slider.loop(true);

                        if (photo.length <= 1)
                            slider.enableSlide(false);
                        else
                            slider.enableSlide(true);

                        slider.update();
                    }, 20);
                }
                data[0].photo = photo;
                $scope.detail = data;
                console.log($scope.detail)
            },
            function(data) {
                $scope.detail = null;
                var errMsg = data.err_msg || "未知错误";
                PopupFact.alert("错误", errMsg);
            }
        );
    }

    // query product parameter
    function queryParameter(){
        return HttpFact.User("GET", apiDomain + "/Product/getProductParame",{}, { "id": $stateParams.id }, {}).then(
            function(data) {
                if (data) {
                    $scope.parameter = data;
                }
                console.log(data)
            },
            function(data) {
                $scope.parameter = null;
                var errMsg = data.err_msg || "未知错误";
                PopupFact.alert("错误", errMsg);
            }
        );
    }
    // refresh data 
    $scope.refresh = function () {
        $q.all([queryDetail(),queryParameter()]).then(function () {
          //更新Scroll
          $ionicScrollDelegate.resize();
          //告诉IONIC框架，刷新完毕
          $scope.$broadcast("scroll.refreshComplete");
        })
    }
    $scope.$on("$ionicView.loaded", function(event, view) {
        $scope.refresh();
    });
});