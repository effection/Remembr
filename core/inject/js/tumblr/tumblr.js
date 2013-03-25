/**
 * Load window.Tumblr
 */
define(['logger'], function(Logger) {
	
	if(!window.Tumblr) {
		Logger.error('window.Tumblr isn\'t there');
		//TODO Load our own version of Backbone
	} 

	return window.Tumblr;
});