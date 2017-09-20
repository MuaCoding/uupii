var uupii = angular.module('uupii.routes', [])

uupii.config(function($stateProvider) {
    $stateProvider
        
        // index page
        .state('index', {
            url: "/index",
            templateUrl: "views/index.html",
            controller: "indexCtrl",
            login: true
        })
        // classify page
        .state('classify', {
            abstract: true, //设置这个界面为母版界面
            url: "/classify",
            template: '<ion-nav-view></ion-nav-view>'
        })
        .state('classify.index', {
            url: "/index",
            templateUrl: "/views/classify/index.html",
            controller: "classifyCtrl",
            login: true  //
        })
        .state('news', {
            abstract: true, //设置这个界面为母版界面
            url: "/news",
            template: '<ion-nav-view></ion-nav-view>'
        })
        // product detail page
        .state('news.index', {
            url: "/index",
            templateUrl: "views/news/index.html",
            controller: "newsCtrl",
            login: true  //
        })
        .state('orders', {
            abstract: true, //设置这个界面为母版界面
            url: "/orders",
            template: '<ion-nav-view></ion-nav-view>'
        })

        // order 
        .state('orders.index', {
            url: "/index",
            templateUrl: "views/orders/index.html",
            controller: "ordersCtrl",
            login: true  //
        })
        
        // order 
        .state('login', {
            url: "/login",
            templateUrl: "views/form/login.html",
            controller: "loginCtrl"
        })
        // user center page
        .state('user', {
            abstract: true, //设置这个界面为母版界面
            url: "/user",
            template: '<ion-nav-view></ion-nav-view>'
        })
        .state('user.index', {
            url: "/index",
            templateUrl: "/views/user/index.html",
            controller: "userCtrl",
            login: true
        })

        // user center page
        .state('product', {
            abstract: true, //设置这个界面为母版界面
            url: "/product",
            template: '<ion-nav-view></ion-nav-view>',
        })
        // product detail 
        .state('product.detail', {
            url: "/detail/{id:[0-9]*}",
            templateUrl: "views/products/detail.html",
            controller: "product.detailCtrl",
            login: true  //
        })
        
});