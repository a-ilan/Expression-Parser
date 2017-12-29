'use strict';
var angular = require('angular');
var Lexer = require('lex');
var Parser = require('./shunt.js');

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
var parser;
var operator;
setupParser();

function setupParser(){
	lexer = new Lexer;
	lexer.addRule(/\s+/, function () {
		// skip whitespace
	});
	lexer.addRule(/[a-z]/, function (lexeme) {
		return lexeme;
	});
	lexer.addRule(/[\(\+\-\*\/\)]/, function (lexeme) {
		 return lexeme; // punctuation
	});
	var factor = {
		precedence: 2,
		associativity: "left"
	};
	var term = {
		precedence: 1,
		associativity: "left"
	};
	parser = new Parser({
		"+": term,
		"-": term,
		"*": factor,
		"/": factor
	});
	operator = {
		"+": "add",
		"-": "subtract",
		"*": "multiply",
		"/": "divide"
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

//step 2: parse tokens to postfix notation
function postfix(tokens){
	return parser.parse(tokens);
}

//step 3: parse postfix
function parse(postfix){
	var stack = [];
	postfix.forEach(function (c){
		switch (c) {
		case "+":
		case "-":
		case "*":
		case "/":
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