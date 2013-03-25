/**
 * Load Tumblr's instance of backbone and return Backbone.Events
 */
define(['logger', 'modules/injector'], function(Logger, Injector) {
	
	if(!window.Backbone) {
		Logger.error('Tumblr isn\'t using Backbone');
		Injector.numJsSurprises++;
		//TODO Load our own version of an EventEmitter
	} else if(window.Backbone.VERSION !== "0.9.2") {
		Logger.warn('Tumblr has updated Backbone');
		Injector.numJsSurprises++;
	}

	return window.Backbone.Events;
});