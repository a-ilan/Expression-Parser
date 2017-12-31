'use strict';
import {module} from 'angular';
import {Parser} from './parser/parser.js';
var parser = new Parser();

var app = module('myApp', []);
app.controller('myCtrl', [ '$scope', function($scope) {
	$scope.input = '(9-(8+x*7)^-6.5)/y';
	$scope.font_color = "darkgreen";
	
	$scope.result = function(){
		if($scope.input == ''){
			$scope.font_color = "darkgreen";
			return 'Enter an expression';
		}
		try{
			$scope.font_color = "darkgreen";
			return parser.parse($scope.input);
		} catch(err){
			$scope.font_color = "darkred";
			return err; 
		}
	};
}]);