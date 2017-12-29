var Lexer = require('lex');
var Shunt = require('./shunt.js');
var lexer;
var shunt;

function Parser(regEx, operator) {
	this.regEx = regEx;
	this.operator = operator;
	setup(regEx, operator);
}

function setup(regEx, operator){
	lexer = new Lexer;
	lexer.addRule(/\s+/, function () {
		// skip whitespace
	});
	lexer.addRule(regEx.number, function (lexeme) {
		return lexeme; // numbers
	});
	lexer.addRule(regEx.word, function (lexeme) {
		return lexeme; // words
	});
	lexer.addRule(regEx.operator, function (lexeme) {
		 return lexeme; // operators
	});
	shunt = new Shunt(operator);
}

//step 1: tokenize
Parser.prototype.tokenize = function(input){
	lexer.setInput(input);
	var tokens = [];
	var token;
	while (token = lexer.lex()) tokens.push(token);
	return tokens;
};

//step 2: convert tokens to postfix notation
Parser.prototype.postfix = function(tokens){
	return shunt.parse(tokens);
};

//step 3: parse tokens in postfix notation
Parser.prototype.parsePostfix = function(postfix){
	var regEx = this.regEx;
	var operator = this.operator;
	var stack = [];
	postfix.forEach(function (token){
		if(compare(regEx.operator,token)){
			if(operator[token].type == 'unary'){
				var b = stack.pop(); 
				if(b == undefined) throw new Error("Invalid expression");
				stack.push(operator[token].name + "(" + b + ")");
			} else if(operator[token].type == 'binary'){
				var b = stack.pop(); //operand B
				var a = stack.pop(); //operand A
				if(a == undefined) throw new Error("Invalid expression");
				if(b == undefined) throw new Error("Invalid expression");
				stack.push(operator[token].name + "(" + a + ", " + b + ")");
			}
		} else if(compare(regEx.number,token)){
			stack.push("number("+token+")");
		} else {
			stack.push(token);
		}
	});
	if(stack.length > 1) throw new Error("Invalid expression");
	return stack.pop();
};

Parser.prototype.parse = function(input){
	return this.parsePostfix(this.postfix(this.tokenize(input)));
};

function compare(regEx,str){
	return new RegExp('^'+regEx.source+'$').test(str);
}

module.exports = Parser;