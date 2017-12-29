'use strict';
var angular = require('angular');
var Lexer = require('lex');
var Shunt = require('./shunt.js');

var app = angular.module('myApp', []);
app.controller('myCtrl', [ '$scope', function($scope) {
	$scope.input = '';
	
	$scope.result = function(){
		try{
			return parse(postfix(tokenize($scope.input)));
		} catch(err){
			return err; 
		}
	};
}]);

var lexer;
var shunt;
var operator;
setup();

function setup(){
	lexer = new Lexer;
	lexer.addRule(/\s+/, function () {
		// skip whitespace
	});
	lexer.addRule(/\d+(\.\d+)?/, function (lexeme) {
		return lexeme; // numbers
	});
	lexer.addRule(/[a-zA-Z_]+\w*/, function (lexeme) {
		return lexeme; // words
	});
	lexer.addRule(/[\(\+\-\*\/\^\)]/, function (lexeme) {
		 return lexeme; // operators
	});
	var term = {
		precedence: 1,
		associativity: "left"
	};
	var factor = {
		precedence: 2,
		associativity: "left"
	};
	var exponent = {
		precedence: 3,
		associativity: "right"
	}
	shunt = new Shunt({
		"+": term,
		"-": term,
		"*": factor,
		"/": factor,
		"^": exponent
	});
	operator = { //name and type
		"+": "add",
		"-": "subtract",
		"*": "multiply",
		"/": "divide",
		"^": "pow"
	};
}

//step 1: tokenize
function tokenize(input){
	lexer.setInput(input);
	var tokens = [];
	var token;
	while (token = lexer.lex()) tokens.push(token);
	return tokens;
}

//step 2: convert tokens to postfix notation
function postfix(tokens){
	return shunt.parse(tokens);
}

//step 3: parse tokens in postfix notation
function parse(postfix){
	var stack = [];
	postfix.forEach(function (c){
		switch (c) {
		case "+":
		case "-":
		case "*":
		case "/":
		case "^":
			var b = stack.pop();
			var a = stack.pop();
			if(a == undefined)
				stack.push(operator[c] + "(" + b + ")");
			else
				stack.push(operator[c] + "(" + a + ", " + b + ")");
			break;
		default:
			stack.push(c);
		}
	});
	return stack.pop();
}