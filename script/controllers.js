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
    var hot = ListFact({user: true, url: apiDomain + "/Product/getProductList", parameter: { "saleSort": 1}, method: true, type: "pro"});
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
// product news page
uupii.controller("newsCtrl", function($scope, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, PopupFact, ModalFact) {

});
// product orders page
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

// product detail page 
uupii.controller("product.detailCtrl", function($q, $scope, $state, $stateParams, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate, HttpFact, ListFact, PopupFact, ModalFact, PopoverFact){
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
            }
        );
    }
    // query brand information
    function queryBrand(){
        return HttpFact.User("GET", apiDomain + "/product/get_provAgent",{}, { "id": $stateParams.id }, {}).then(
            function(data) {
                if (data) {
                    $scope.brand = data;
                }
                console.log(data)
            },
            function(data) {
                $scope.brand = null;
            }
        );
    }

    // view servier Explain
    var servierPopover = null;
    $scope.view_explain = function(){
        PopoverFact.show($scope, "service.html").then(function(popover){
            servierPopover = popover;
        });
    };
    // close 
    $scope.close_explain = function(){
        PopoverFact.hide(servierPopover);
    };

    // view param
    var paramPopover = null;
    $scope.view_param = function(){
        PopoverFact.show($scope, "parameter.html").then(function(popover){
            paramPopover = popover;
        });
    };
    // close 
    $scope.close_param = function(){
        PopoverFact.hide(paramPopover);
    };

    // refresh data 
    $scope.refresh = function () {
        $q.all([queryDetail(),queryParameter(),queryBrand()]).then(function () {
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

uupii.controller("product.storeCtrl", function($q, $scope, $state, $stateParams, $ionicScrollDelegate, HttpFact, ListFact, PopupFact) {
    $scope.input = {};
    // query brand information
    function queryStore(){
        return HttpFact.User("GET", apiDomain + "/Product/get_provAgentInfo",{}, { "id": $stateParams.id }, {}).then(
            function(data) {
                if (data) {
                    $scope.store = data;
                    $scope.input.like = data[0].Iscollection;
                }
            },
            function(data) {
                $scope.store = null;
            }
        );
    }
    // query hot data
    var pros = ListFact({user: true, url: apiDomain + "/Product/getProductList", parameter: { "ProvAgentId": $stateParams.id}, method: true, type: "pro"});
    $scope.pros = pros;
    console.log(pros)
    // loading more
    $scope.loadMore = function(){
        if (pros.loaded) {
            pros.next();
        }
    };
    // 收藏点击事件
    $scope.like_action = function(id){
        console.log(id)
        return HttpFact.User("POST", apiDomain + "/User/Add_Collect_ProvAgent", { "pa_id": id },{}, {}).then(
            function(data) {
                switch (data.res_code) {
                    case 1:
                        $scope.input.like = !$scope.input.like;
                        break;
                    default: 
                        errorServices.show("未知错误");
                        break;
                }
            },
            function(data) {

            }
        );
    }
    // 申请点击事件
    $scope.apply_action = function(store){
        if (store[0].IsVip == 1) {
            PopupFact.alert("提示","您已是本店会员");
            return;
        };

        PopupFact.confirm("提示","您正申请该店会员").then(function(res){
            if(res){
                return HttpFact.User("GET", apiDomain + "/User/Applymember",{}, { "ProvAgentId": store[0].ProvAgentId }, {}).then(
                    function(data) {
                        switch (data.res_code) {
                            case 0:
                                PopupFact.alert(data.res_msg);
                                break;
                            case 1:
                                PopupFact.alert("提示",data.res_msg);
                                store[0].IsVip = 0;
                                break;
                            case 2:
                                PopupFact.alert("提示","您已申请过，请耐心等待审核结果");
                                break;
                        }
                    },
                    function(data) {
                    }
                )
            }
        })
    }
    // refresh data 
    $scope.refresh = function () {
        $q.all([queryStore(),pros.reset()]).then(function () {
          //更新Scroll
          $ionicScrollDelegate.resize();
          //告诉IONIC框架，刷新完毕
          $scope.$broadcast("scroll.refreshComplete");
        })
    };
    // ngrepeat finish event
    $scope.proFinish = function(handle) {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $ionicScrollDelegate.$getByHandle(handle).resize();
    };

    $scope.$on("$ionicView.loaded", function(event, view) {
        $scope.refresh();
    });
});