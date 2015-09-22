/*global.System = require('es6-module-loader').System;
//System.transpiler = 'babel';

require('babel/register');
System.import('index.jsx').then(function(m) {
	console.log('done');
}).catch(function(e) {
	console.log(e);
});*/

require('babel/register')({stage: 1});
require('./index.es6');
