'use strict';
var angular = require('angular');
var Parser = require('./parser.js');

var app = angular.module('myApp', []);
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

var regEx = {
	number: /\d+(\.\d+)?/,
	word: /[a-zA-Z_]+\w*/,
	operator: /([\(\+\-\*\/\^\)]|neg|pos)/
}

var operator = {
	"+": { //term
		name: "add",
		type: 'binary',
		precedence: 1,
		associativity: "left"
	},
	"-": { //term
		name: "sub",
		type: 'binary',
		precedence: 1,
		associativity: "left"
	},
	"*": { //factor
		name: "mul",
		type: 'binary',
		precedence: 2,
		associativity: "left"
	},
	"/": { //factor
		name: "div",
		type: 'binary',
		precedence: 2,
		associativity: "left"
	},
	"^": { //exponent
		name: "pow",
		type: 'binary',
		precedence: 3,
		associativity: "right"
	},
	"neg":{
		name: "neg",
		type: 'unary',
		precedence: 3,
		associativity: "right"
	},
	"pos":{
		name: "pos",
		type: 'unary',
		precedence: 3,
		associativity: "right"
	}
};

var parser = new Parser(regEx,operator);