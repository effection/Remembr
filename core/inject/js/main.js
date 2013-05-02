/**
 * Injected script entry point
 */
require.config({
	waitSeconds: 200,
	paths: {
		'jquery': 'lib/jquery',
		'logger': 'lib/logger',
		'underscore' : 'tumblr/underscore',
		'eventEmitter' : 'tumblr/backbone',
		'tumblr' : 'tumblr/tumblr',
		'storage' : '../../../browser/js/storage'
	}
});

require(['logger', 'modules/injector', 'modules/extender'], function(Logger, Injector, Extender) {
	Logger.useDefaults();
	Logger.info('Remembr loading');

	//Call the injector init async as it executes on domReady and pass the Extender.init as it's callback
	Injector.init(Extender.init);
});