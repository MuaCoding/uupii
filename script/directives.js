var uupii = angular.module('uupii.directives', []);


//ngRepeat完成事件
uupii.directive('repeatDone', function() {
    return function(scope, element, attrs) {
        if (attrs.orderBy == "asc") {
            if (scope.$first) {
                scope.$eval(attrs.repeatDone);
            }
        } else {
            if (scope.$last) {
                scope.$eval(attrs.repeatDone);
            }
        }
    };
});

//reset ngbind, no data bind default data
uupii.directive('ngBind', function() {
    return function(scope, element, attrs) {
        scope.$watch(function() {
            return element[0].innerHTML
        }, function(n, o) {
            if (n != o && n == '') {
                element[0].innerHTML = o;
            };
        })
    }
})
//reset ui-sref 
uupii.directive('uiSref', function ($rootScope) {
    return function(scope, element, attrs) {
        element.on('click', function() {
            if (attrs.nextDirection) {
                $rootScope.nextDirection = attrs.nextDirection;
            } else {
                $rootScope.nextDirection = "exit";
            };
        })
    }
})


//picture error or disply resolve
uupii.directive('viewSrc', function($timeout) {
    function isUrl(url) {
        var rep = new RegExp('^((https|http)?://)', 'gi'); // has https or http ?
        if (rep.test(url)) {
            return (true);
        } else {
            return (false);
        };
    };

    function init(attrs, src, watch) {
        var image = new Image();
        image.onload = function() {
            $timeout(function() {
                attrs.$set('src', src);
            }, 20);
        };
        image.onerror = function() {
            if (!isUrl(src)) {
                init(attrs, domain + src, watch)
            } else {
                $timeout(function() {
                    attrs.$set('src', attrs.errSrc);
                }, 20);
            };
        };
        image.src = src;
    };

    return function(scope, element, attrs) {
        var watch = scope.$watch(function() {
            return attrs.viewSrc;
        }, function(n, o) { //n == new value, o == old value
            if (n) {
                init(attrs, n, o)
            };
        })
    };
});


// footer nav
uupii.directive('hasTabs', function($stateParams, $sce, $compile, $templateRequest) {
    return function(scope, element, attrs) {
        var tpl = "templates/tabs.html";
        // ??????????
        if (attrs.tabsType) {
            tpl = "templates/" + attrs.tabsType + ".html";
        };

        $templateRequest(tpl, true).then(function(response) {
            scope.tabsState = attrs.hasTabs;
            element.find("ion-content").addClass("has-tabs");
            element.append($compile(response)(scope));
        })
    }
})

uupii.directive("tab", function($rootScope, $state) {
    return function(scope, element, attrs) {
        element.on('click', function() {
            $rootScope.nextDirection = "enter";
            if (attrs.state) {
                $state.go(attrs.state);
            };
        })
    }
});

// params select 
uupii.directive('paramsSelect', function($timeout, PopoverFact) {
    return {
        restrict: "EA",
        scope: {
            title: '=',
            type: '@paramsSelect',
            forms: '='
        },
        link: function(scope, element, attrs) {
            scope.formData = {};
            var paramsPopover = null;
            element.on('click', function() {
                if (scope.forms) {
                    PopoverFact.show(scope, "templates/params.html").then(function(popover) {
                        paramsPopover = popover;
                        $timeout(function() { scope.rzSlider = true }, 20);
                    })
                } else {
                    scope.$emit("paramsSelected", scope.type, null);
                };
            });
            scope.close = function() {
                PopoverFact.hide(paramsPopover);
            }
        },
        controller: function($scope, $element, $attrs) {
            $scope.processForm = function() {
                var params = [],
                    tplForm = angular.copy($scope.formData);
                for (var key in tplForm) {
                    try {
                        if (tplForm[key]) {
                            var form = $scope.forms.filter(function(item) {
                                return item.key === key;
                            })[0];

                            if (tplForm[key].constructor == Array) {
                                tplForm[key] = tplForm[key].join('-');
                            };

                            params.push({
                                key: form.key,
                                value: tplForm[key],
                                label: form.label
                            })
                        };
                    } catch (e) {}
                };
                $scope.close();
                $timeout(function() { $scope.$emit("paramsSelected", $scope.type, params); }, 100)
            }
        }
    }
})

uupii.directive('newInput', function($timeout, PopupFact) {
    return {
        restrict: "EA",
        scope: {
            ngModel: '=',
            label: '=newInput',
            placeholder: '='
        },
        link: function(scope, element, attrs) {
            element.on('click', function() {
                scope.data = {
                    input: scope.ngModel
                }
                var popup = PopupFact.show({
                    title: scope.label,
                    cssClass: 'singleInput',
                    template: '<input type="text" ng-model="data.input" placeholder="' + scope.placeholder + '" autofocus>',
                    scope: scope,
                    buttons: [
                        { text: '取消' },
                        {
                            text: '确定',
                            type: 'button-positive',
                            onTap: function(e) {
                                scope.ngModel = scope.data.input;
                            }
                        }

                    ]
                })
            })
        }
    }
})