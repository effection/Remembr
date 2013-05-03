/**
 * Add extra classes to Tumblr for easy use, read out the settings and hook any useful javascript.
 */

define(['logger', 'jquery', 'tumblrsJquery', 'lib/springyMenu', 'tumblr', 'underscore', 'eventEmitter'], function (Logger, $, $_Tumblr, SpringyMenu, Tumblr, _, EventEmitter) {

	var module = {
		init: init,

		inlineAlertUser: inlineAlertUser,

		hookedNotifications: false,
		numHtmlSurprises: 0,
		numJsSurprises: 0,

		settings: {
			
		}
	};

	var loaded = false;

	/**
	 * Async init for accessing the dom
	 */
	function init(cb) {
		if(!loaded) {
			$(function() {
				addExtraClasses();
				hookNotifications();
				readTumblrSettings();

				loaded = true;

				if(typeof(cb) === 'function') cb();
			});

		} else {
			if(typeof(cb) === 'function') cb();
		}
    }

    /**
     *Add classes to a few objects for styling / ease
     */
    function addExtraClasses() {
		module.numHtmlSurprises = 0;
        $('body').addClass('remembr');

		//Do a check to see if any of the major html has changed indicating the plugin probably isn't going to work
		if($('#left_column').length < 1) module.numHtmlSurprises++;
		if($('#new_post').length < 1) module.numHtmlSurprises++;
    }

    /**
     * Get available settings
     */
    function readTumblrSettings() {
		if(!Tumblr) {
			Logger.error('Big trouble - no window.Tumblr');
			module.numJsSurprises = 999;
			return;
		}

		if(!Tumblr.auto_paginate) module.numJsSurprises++
		module.settings.autoPaginate = Tumblr.auto_paginate || false;
    }

	/**
	 * Hook notifications to fire Backbone events
	 */
	function hookNotifications() {
		if(!Tumblr) {
			Logger.error('Big trouble - no window.Tumblr');
			module.numJsSurprises = 999;
			return;
		}

		if (!Tumblr.Thoth) {
			Logger.warn('Tumblr.Thoth doesn\'t exist');
			module.numJsSurprises++;
			module.hookedNotifications = false;
			return
		}

		if(typeof(Tumblr.Thoth.parse_unread) !== 'function') {
			Logger.warn('Tumblr.Thoth internals changed');
			module.numJsSurprises++;
			module.hookedNotifications = false;
			return
		}

		if(typeof(Tumblr.Thoth.trigger) !== 'function') {
			Logger.warn('Tumblr.Thoth internals changed');
			module.numJsSurprises++;
			module.hookedNotifications = false;
			return
		}

		var original_parse_notifications = Tumblr.Thoth.parse_notifications;
		var original_parse_unread = Tumblr.Thoth.parse_unread;
		var original_parse_inbox = Tumblr.Thoth.parse_inbox;

		Tumblr.Thoth.last_unread_count = 0;
		Tumblr.Thoth.parse_unread = function (data) {
			original_parse_unread.call(Tumblr.Thoth, data);

			if (typeof data.unread !== 'number')
				return;
			this.trigger('unread', data.unread, this.last_unread_count);
			this.last_unread_count = data.unread;
		}

		module.hookedNotifications = true;
	}

	var inlineAlertQueue = [];
	/**
	 * Place an alert at the top of the page.
	 */
	function inlineAlertUser(html) {
		var $container = $('#inception-alert');
		if($container.length > 0){
			
			//Queue up messages
			var fn = wrapFunction(inlineAlertUser, this, arguments);
			inlineAlertQueue.push(fn);

			return;
		} else 
			$container = $('<div id="inception-alert"></div>');

		html = '<div class="logo"></div>' + html;
		$container.append(html);
		$container.append('<div style="float: right; padding: 4px 10px; font-size: 12px;"><a class="close-alert" href="#">close</a></div>');

		$('body').append($container);
		$('#inception-alert > div > .close-alert').click(function(e) {
			e.stopPropagation();
			$('#inception-alert').slideUp(300, function() {
				$('#inception-alert').remove();

				//Check the alert queue
				if(inlineAlertQueue.length > 0) (inlineAlertQueue.shift())();
			});
		})
	 }

	 var wrapFunction = function(fn, context, params) {
		return function() {
			fn.apply(context, params);
		};
	}


    return module;
});