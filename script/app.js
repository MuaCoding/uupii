var domain = "http://m.uupii.com";
var apiDomain = "http://api.uupii.com/web";

var uupii = angular.module('uupii', [
    'ionic',
    'uupii.services',
    'uupii.directives',
    'uupii.filters',
    'uupii.routes',
    'uupii.controllers' //主模块
]);

uupii.config(function($ionicConfigProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $ionicConfigProvider.scrolling.jsScrolling(true);
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.navBar.alignTitle("center");
    $ionicConfigProvider.views.forwardCache(true);

    $urlRouterProvider.when("/", "/index");
    $urlRouterProvider.when("/classify", "/classify/index");
    $urlRouterProvider.when("/news", "/news/index");
    $urlRouterProvider.when("/orders", "orders/index");
    $urlRouterProvider.when("/user", "/user/index");
    $urlRouterProvider.otherwise("/index");
});

uupii.run(function($rootScope, $state, $location, $timeout, $ionicHistory, $ionicViewSwitcher, HttpFact, PopupFact, ModalFact, PopoverFact) {
    // reset back action
    $rootScope.nextDirection = null;
    $rootScope.$ionicGoBack = function(router) {
        if (!$rootScope.nextDirection) {
            $rootScope.nextDirection = "back";
        };
        if ($ionicHistory.backView()) {
            history.back(-1);
        } else {
            var parent = $state.$current.parent;
            //find bast top parent route
            while (1) {
                var parents = parent.parent;
                // console.log(parent)
                if (parents.self.name == "") break;
                else parent = parents;
            }
            if (!router) {
                router = parent.self.abstract ? parent.url.sourcePath : parent.self.url || "/home";
            };

            $location.path(router);
        };
    };

    // forword action
    $rootScope.$ionicGoForward = function(to, params, options) {
        if (!$rootScope.nextDirection) {
            $rootScope.nextDirection = "forward";
        };
        $state.go(to, params, options);
    };
    // route change start event
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        // popover not close, stop router change 
        if (PopoverFact.shown()) {
            PopoverFact.hide(PopoverFact.shown());
            if (ionic.Platform.isAndroid()) {
                history.pushState('forward', null, '#');
                history.forward(1);
                event.preventDefault();
            };
            if (ionic.Platform.isIOS()) { PopoverFact.clear(); };
        };

        // modal not close, stop router change 
        if (ModalFact.shown()) {
            ModalFact.hide(ModalFact.shown());
            if (ionic.Platform.isAndroid()) {
                history.pushState('forward', null, '#');
                history.forward(1);
                event.preventDefault();
            };
            if (ionic.Platform.isIOS()) { ModalFact.clear(); };
        };

        // Popup not close, stop router change 
        if (PopupFact.list().length > 0) {
            PopupFact.clear();
            if (ionic.Platform.isAndroid()) {
                history.pushState('forward', null, '#');
                history.forward(1);
                event.preventDefault();
            }
        }
        // determine whether need login
        var flag = false,
            parents = toState.name.split('.'),
            current = null;
        for (var i = 0; i < parents.length; i++) {
            current = current ? current + "." + parents[i] : parents[i];
            var state = $state.get(current);
            flag = typeof(state.login) == "undefined" ? flag : state.login;
        }
        // need login direct Jump login page
        if (flag && !whether_login()) {
            event.preventDefault();
            $rootScope.Jump_login();
        };

        if ($rootScope.nextDirection) {
            $ionicViewSwitcher.nextDirection($rootScope.nextDirection);
        } else {
            if (ionic.Platform.isIOS()) { $ionicViewSwitcher.nextDirection("exit"); };
        };
    });
    // route change success event
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        $rootScope.nextDirection = null;
    });
    // faild connect data jump login
    $rootScope.Jump_login = function(url) {
        localStorage.removeItem("openId");
        localStorage.removeItem("user_token");
        localStorage.removeItem("in_exp");
        $location.url("login" + (url ? ("?url=" + url) : ""));
    }
});