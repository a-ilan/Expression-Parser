var Lexer = require('lex');
var Shunt = require('./shunt.js');
var lexer;
var shunt;

var regEx = {
	number: /\d+(\.\d+)?/,
	word: /[a-zA-Z_]+\w*/,
	operator: /([\+\-\*\/\^]|neg|pos)/,
	brackets: /[\(\)]/
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

//unary functions
var neg = 'neg';
var pos = 'pos';
var num = 'num';

function Parser() {
	shunt = new Shunt(operator);
	lexer = new Lexer;
	lexer.addRule(/\s+/, function () {
		// skip whitespace
	});
	lexer.addRule(regEx.number, function (token) {
		return token; // numbers
	});
	lexer.addRule(regEx.word, function (token) {
		return token; // words
	});
	lexer.addRule(regEx.brackets, function(token){
		return token;
	})
	lexer.addRule(regEx.operator, function (token) {
		return token; // operators
	});
}

//step 1: tokenize
Parser.prototype.tokenize = function(input){
	lexer.setInput(input);
	var tokens = [];
	var token;
	while (token = lexer.lex()) tokens.push(token);
	return tokens;
};

//process tokens
Parser.prototype.processTokens = function(tokens){
	var is_prev_num = false;
	for(var i = 0; i < tokens.length; i++){
		var token = tokens[i];
		if(token == ')'){
			is_prev_num = true;
		} else if(token == '('){
			is_prev_num = false;
		} else if(compare(regEx.number,token)){
			is_prev_num = true;
			tokens[i] = num + '(' + tokens[i] + ')';
		} else if(compare(regEx.word,token)){
			is_prev_num = true;
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
				throw new Error("Unexpected token: \"" + token + "\"");
			}
		} else {
			stack.push(token);
		}
	});
	if(stack.length > 1) throw new Error("Invalid expression: "+stack);
	return stack.pop();
};

Parser.prototype.parse = function(input){
	return this.parsePostfix(this.postfix(this.processTokens(this.tokenize(input))));
};

function compare(regEx,str){
	return new RegExp('^'+regEx.source+'$').test(str);
}

module.exports = {Parser:Parser};