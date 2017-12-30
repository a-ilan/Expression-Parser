var Lexer = require('lex');
var Shunt = require('./shunt.js');
var lexer;
var shunt;

//unary functions
var neg = 'neg';
var pos = 'pos';
var num = 'num';

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

Parser.prototype.parseNeg = function(tokens){
	var regEx = this.regEx;
	var is_prev_num = false;
	for(var i = 0; i < tokens.length; i++){
		var token = tokens[i];
		if(token == ')' || compare(regEx.number,token) || compare(regEx.word,token)){
			is_prev_num = true;
		} else if(token == '('){
			is_prev_num = false;
		} else if(compare(regEx.operator,token)){
			if(is_prev_num == false){
				if(token == '-'){
					tokens[i] = neg;
				} else if(token == '+'){
					tokens[i] = pos;
				}
			}
			is_prev_num = false;
		}
	}
	return tokens;
}

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
			 if(operator[token].type == 'binary' && stack.length >= 2){
				var b = stack.pop(); //operand B
				var a = stack.pop(); //operand A
				stack.push(operator[token].name + "(" + a + ", " + b + ")");
			} else if(operator[token].type == 'unary' && stack.length >= 1){
				var b = stack.pop();
				stack.push(operator[token].name + "(" + b + ")");
			} else {
				throw new Error("Invalid operator: " + token);
			}
		} else if(compare(regEx.number,token)){
			stack.push(num+"("+token+")");
		} else {
			stack.push(token);
		}
	});
	if(stack.length > 1) throw new Error("Invalid expression: " + stack);
	return stack.pop();
};

Parser.prototype.parse = function(input){
	//return this.parseNeg(this.tokenize(input));
	return this.parsePostfix(this.postfix(this.parseNeg(this.tokenize(input))));
	//return this.parsePostfix(this.postfix(this.tokenize(input)));
	//return this.postfix(this.tokenize(input));
	//return this.tokenize(input);
};

function compare(regEx,str){
	return new RegExp('^'+regEx.source+'$').test(str);
}

module.exports = Parser;