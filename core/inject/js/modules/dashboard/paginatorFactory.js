/**
 * AutoPaginator
 */

define(['jquery'], function($) {
	var factory = {
		createAutoPaginator: createAutoPaginator,
		createNormalPager: createNormalPager
	};

	function createAutoPaginator($postsContainer, $scollingElement, startPage) {
		return new AutoPaginatorContainer($postsContainer, $scollingElement, startPage);
	}

	function createNormalPager($scollingElement, startPage) {
		return new NormalPageContainer($scollingElement, startPage);
	}

	/**
	 * Custom AutoPaginator - slightlyyyyy modified version of Tumblr's! This is what needs to be kept up to date after tumblr changes! 
	 * 
	 * exports should be an empty object so the paginator isn't a static global instance
	 */
	function AutoPaginatorContainer($postsContainer, $scollingElement, startPage) {
		var AutoPaginator = {
			start: function () {
				retries = 3;
				this.interval = setInterval(poll, 123)
			},
			stop: function () {
				loading_next_page = false;
				clearInterval(this.interval)
			},

			/**
			 * Set the next page that will load when the AutoPaginator deems it should get the next page
			 */
			setNextPageToLoad: setNextPageToLoad,

			getNextPageUrl: getNextPageUrl,

			/**
			 * Force the loading of the next page
			 */
			loadNextPage: loadNextPage
		};
		_.extend(AutoPaginator, Backbone.Events);

		/**
		 * Set the next page that will load when the AutoPaginator deems it should get the next page
		 */
		function setNextPageToLoad(page, cb) {
			if (loading_next_page) {
					this.on('after', _.bind(function afterLoadSetNextPage(page) {
						this.off('after', afterLoadSetNextPage);

						next_page = page;
						if(typeof(cb) === 'function') cb();

					}, this));
					return false;
				} else {
					next_page = page;
					if(typeof(cb) === 'function') cb();
					return true;
				}
		}

		function getNextPageUrl() {
			return next_page;
		}

		/**
		 * Force the loading of the next page
		 */
		function loadNextPage(addToPosts) {
			if (!next_page) return;
			loading_next_page = true;
			if(typeof(addToPosts) == "undefined" || addToPosts == null) addToPosts = true;

			_before_auto_pagination();
			AutoPaginator.trigger("before", next_page);

			$('#auto_pagination_loader_loading').show();
			$('#auto_pagination_loader_failure').hide();

			load_next_page(addToPosts);
		}


		var retries = 3;
		var loading_next_page = false;
		var next_page = startPage;
		//var shouldAdd
		/**
		 * Is the post shown on screen.
		 */
		function in_viewport(el) {
			if (typeof el === 'undefined' || el === null)
				return false;
			var top = $(el).position().top;
			var scroll = $scollingElement.scrollTop();
			var viewport_height = $scollingElement.height();
			/*
			var top = el.offsetTop;
			var scroll = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			var viewport_height = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight;
			*/
			return (top < (scroll + viewport_height))
		}

		/**
		 * Constantly check if scrolled far enough to start loading next page.
		 */
		function poll() {
			if (!next_page) {
				if ($('#auto_pagination_loader').is(':visible')) {
					$('#auto_pagination_loader').hide()
				}
				AutoPaginator.stop();
				return
			}
			var posts;
			if (next_page && !loading_next_page && (posts = $('.post', $postsContainer)/*$('#posts > .post')*/) && posts.length > 0 && (((posts.length >= 3) && in_viewport(posts[posts.length - 4])) || ((posts.length < 3) && in_viewport(posts[posts.length - 1])))) {
				loading_next_page = true;
				_before_auto_pagination();
				AutoPaginator.trigger("before", next_page);
				$('#auto_pagination_loader_loading').show();
				$('#auto_pagination_loader_failure').hide();
				load_next_page()
			}
		}

		/**
		 * Start loading next page.
		 */
		function load_next_page(addToPosts) {
			if(typeof(addToPosts) == "undefined" || addToPosts == null) addToPosts = true;

			retries--;
			var req = $.ajax({url: next_page,type: 'get'});
			req.done(function(html) {
				process_response(html, addToPosts);
				var next_page_header = req.getResponseHeader('X-next-page');
				if (next_page_header) {
					next_page = next_page_header
				} else {
					next_page = html.match('id="next_page_link" href="') ? html.split('id="next_page_link" href="')[1].split('"')[0] : false
				}
			});
			req.fail(function() {
				if (retries)
					load_next_page(addToPosts);
				else
					give_up()
			})
		}

		/**
		 * Grab new posts and add to container.
		 */
		function process_response(html, addToPosts) {
			if (html.indexOf('<script type="text/javascript" language="javascript" src="http://assets.tumblr.com/languages/errors.js') !== -1) {
				AutoPaginator.stop();
				return false
			}
			var new_posts;
			if (html.indexOf('<!-- START POSTS -->') === -1) {
				new_posts = html
			} else {
				new_posts = html.split('<!-- START POSTS -->')[1].split('<!-- END POSTS -->')[0]
			}

			if(addToPosts)
				$postsContainer.append(new_posts);

			track();
			loading_next_page = false;
			setTimeout(function() {
				if (typeof window.after_auto_paginate == 'function')
					after_auto_paginate();
				_after_auto_pagination();

				var $new_posts = null;
				if(!addToPosts) {
					$new_posts = $('<div>');
					$new_posts = $('.post', $new_posts.html(new_posts));
				}

				AutoPaginator.trigger("after", next_page, $new_posts);
			}, 0)
		}

		/**
		 * Stop autopaginator and show failure message.
		 */
		function give_up() {
			AutoPaginator.stop();
			$('#auto_pagination_loader_loading').hide();
			$('#auto_pagination_loader_failure').show()
		}

		/**
		 * Unimportant
		 */
		function track() {
			next_page = next_page.replace(/https?:\/\/.*?\//, "/");
			if (next_page.indexOf("/dashboard") === 0) {
				next_page = next_page.substring(0, next_page.lastIndexOf("/"))
			}
			if (window._gaq !== undefined) {
				try {
					var o = tumblr_custom_tracking_url ? tumblr_custom_tracking_url : next_page;
					_gaq.push(["_trackPageview", o])
				} catch (p) {
					Tumblr.Capture.Exceptions.add(p)
				}
			}
			if (window.__qc) {
				try {
					__qc.qpixelsent = [];
					_qevents.push({qacct: "p-19UtqE8ngoZbM"})
				} catch (p) {
					Tumblr.Capture.Exceptions.add(p)
				}
			}
			if (typeof (COMSCORE) !== "undefined") {
				try {
					COMSCORE.beacon({c1: "2",c2: "15742520"})
				} catch (p) {
					Tumblr.Capture.Exceptions.add(p)
				}
			}
		}

		var BeforeAutoPaginationQueue = [];
		function _before_auto_pagination() {
			for (var i = BeforeAutoPaginationQueue.length - 1; i >= 0; i--) {
				if (typeof (BeforeAutoPaginationQueue[i]) === 'function') {
					BeforeAutoPaginationQueue[i]()
				}
			}
		}
		var AfterAutoPaginationQueue = [];
		function _after_auto_pagination() {
			for (var i = AfterAutoPaginationQueue.length - 1; i >= 0; i--) {
				if (typeof (AfterAutoPaginationQueue[i]) === 'function') {
					AfterAutoPaginationQueue[i]()
				}
			}
		}
		//exports.AutoPaginator = AutoPaginator;
		//window.BeforeAutoPaginationQueue = BeforeAutoPaginationQueue;
		//window.AfterAutoPaginationQueue = AfterAutoPaginationQueue
		return AutoPaginator;
	};

	function NormalPageContainer($scollingElement, startPage) {
		var NormalPages = {
			start: function () {
				
			},
			stop: function () {
				
			},

			/**
			 * Set the next page that will load when the AutoPaginator deems it should get the next page
			 */
			setNextPageToLoad: function (page, cb) {
				
			},

			/**
			 * Force the loading of the next page
			 */
			loadNextPage: function() {
				
			}
		};
		return NormalPages;
	}
	return factory;
});

