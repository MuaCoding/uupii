var uupii = angular.module('uupii.filters', []);

uupii.filter("trusted", function ($sce){
	return function (text){
		return $sce.trustAsHtml(text);
	}
})

uupii.filter('viewCurrency', function ($filter){
	return function (amount, currencySymbol){
		return $filter('currency')(amount, (currencySymbol || '￥'), ((amount - parseInt(amount)) > 0 ? 2 : 0));
	}
})