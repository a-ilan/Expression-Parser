'use strict';
var angular = require('angular');
var Parser = require('./parser.js');

var app = angular.module('myApp', []);
app.controller('myCtrl', [ '$scope', function($scope) {
	$scope.input = '';
	
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
	operator: /[\(\+\-\*\/\^\)]/
}

var operator = {
	"+": { //term
		name: "add",
		type: "binary",
		precedence: 1,
		associativity: "left"
	},
	"-": { //term
		name: "subtract",
		type: "binary",
		precedence: 1,
		associativity: "left"
	},
	"*": { //factor
		name: "multiply",
		type: "binary",
		precedence: 2,
		associativity: "left"
	},
	"/": { //factor
		name: "divide",
		type: "binary",
		precedence: 2,
		associativity: "left"
	},
	"^": { //exponent
		name: "pow",
		type: "binary",
		precedence: 3,
		associativity: "right"
	}
};

var parser = new Parser(regEx,operator);