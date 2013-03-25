/**
 * Load Tumblr's instance of underscore
 */
define(['logger', 'modules/injector'], function(Logger, Injector) {
	
	if(!window._) {
		Logger.error('Tumblr isn\'t using Underscore');
		Injector.numJsSurprises++;
		//TODO Load our own version of Underscore
	} else if(window._.VERSION !== "1.3.3") {
		Logger.warn('Tumblr has updated Underscore');
		Injector.numJsSurprises++;
	}

	return window._;
});