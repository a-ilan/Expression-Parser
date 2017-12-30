'use strict';
var angular = require('angular');
var Parser = require('./parser.js');

var app = angular.module('myApp', []);
app.controller('myCtrl', [ '$scope', function($scope) {
	$scope.input = '9-(x+8)^-7.6';
	
	$scope.result = function(){
		try{
			return parser.parse($scope.input);
		} catch(err){
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