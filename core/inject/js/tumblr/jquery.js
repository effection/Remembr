/**
 * Load Tumblr's instance of backbone and return Backbone.Events
 */
define(['logger', 'modules/injector'], function(Logger, Injector) {
	//Our jquery has overwritten tumblr's...Lets undo that
	var jQuery191 = window.jQuery.noConflict(true);
	window.$ = window.jQuery;

	if(!window.jQuery) {
		Logger.error('Tumblr isn\'t using jQuery');
		Injector.numJsSurprises++;
		//TODO Load our own version of an EventEmitter
	} else if(window.jQuery.fn.jquery !== "1.7.2") {
		Logger.warn('Tumblr has updated jQuery');
		Injector.numJsSurprises++;
	}

	return window.jQuery;
});