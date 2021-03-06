/**
 * Main loader for extensions based on settings. Assumes injector has been called to tidy up things.
 */

 define(['logger', 'underscore', 'jquery', 'modules/settings', 'modules/injector', 'modules/dashboard/paginatorFactory', 'modules/dashboard/rememberScrollUI'], 
 function (Logger, _, $, Settings, Injector, PaginatorFactory, RememberScrollUI) {
	var module = {
		init: init
	};

	var remembrInitd = false;

	/**
	 * Check for any surprises and start loading extensions
	 */
	function init() {
		//Check to see if Tumblr has changed much
		var fatal = false;
		if(Injector.numHtmlSurprises > 0) {
			Logger.warn('Tumblr has changed the html from what is expected, things may not work. (' + Injector.numHtmlSurprises + ')');
	 		if(Injector.numHtmlSurprises >= 999) {
	 			tumblrHasChangedTooMuch();
				fatal = true;
	 		} else {
	 			Injector.inlineAlertUser('<span class="error">Tumblr seems to have made some layout changes. Some features may look incorrect now</span>');
	 		}
	 	}

		if(Injector.numJsSurprises > 0) {
			Logger.warn('Tumblr has changed the javascript from what is expected, things may not work. (' + Injector.numHtmlSurprises + ')');
			if(Injector.numJsSurprises >= 999) {
				if(!fatal) tumblrHasChangedTooMuch();
				fatal = true;
			} else {
				Injector.inlineAlertUser('<span class="error">Tumblr seems to have made some internal changes. Some features may not work right now</span>');
			}
		}

		if(fatal) return;

		loadExtensions();
	}

	/**
	 * Load extensions - DOM is already ready after injector call.
	 */
	function loadExtensions() {
		if(Injector.settings.autoPaginate) {
			Logger.debug('Stopping pager');
			Tumblr.AutoPaginator.stop();
			Logger.debug('Creating new pager');
			Tumblr.AutoPaginator = PaginatorFactory.createAutoPaginator($('#left_column #posts'), $('body'), '/dashboard/2');
			Tumblr.AutoPaginator.start();
			Logger.debug('Started new pager');
		
			if(Settings.get('remembr-scroll').enabled) {
				var r = new RememberScrollUI('dashboard-posts', $('#left_column  #posts'), $('body'), Tumblr.AutoPaginator);

				window.addEventListener("message", function(event) {
					// We only accept messages from ourselves
					if (event.source != window) return;
					if (!event.data) return;
					var data = JSON.parse(event.data);

					switch(data.type) {
						case "tabId":
							if(!data.id) break;
							if(!remembrInitd) {
								r.init(data.id.toString());
								Logger.info('Started remembr.');
								remembrInitd = true;
							}
							break;
					}
				});

				window.postMessage(JSON.stringify({'type' : 'getTabId'}), '*');
			}
		}
	}


	/**
	 * Alert the user that Tumblr must have gone through a redesign so don't expect us to work at all.
	 */
	function tumblrHasChangedTooMuch() {
	 	Injector.inlineAlertUser('<span class="error">Tumblr seems to have changed how it works and this plugin will probably not work at all right now.</span><br/>We\'ll have it working asap.');
	}

	 return module;
});