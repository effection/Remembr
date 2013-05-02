define(['logger', 'jquery', 'underscore', 'modules/dashboard/rememberScroll'], function(Logger, $, _, RememberScroll) {

	/**
	 * Create an unenumerable, shallow unmodifiable private object.
	 */
	function definePrivate(self, variables) {
		if(typeof(self._private) !== 'undefined') return;
		if(typeof(variables) === 'undefined') variables = {};

		return Object.defineProperty(self, '_private', {
			configurable: true,
			enumerable: false,
			value: variables,
			writable: false
		});
	}


	var Container = (function() {
	
		function RememberScrollUI(name, $container, $scrollingContainer, pager) {
			this.instance = new RememberScroll($container.selector, $scrollingContainer, pager);
			this.instance.on('remember-post', onRememberPost);
			this.instance.on('start-search', onStartSearch);
			this.instance.on('narrowing-search', onNarrowingSearch);
			this.instance.on('getting-post', onGettingPost);
			this.instance.on('end-search', onEndSearch);
			this.instance.on('error', onError);

			//Private variables
			definePrivate(this, {
				tab: null,
				savedPosts: [],
				$postsContainer: $('ol.inception-posts', $container),
				$remembrButton: null,

				getRememberPositionForCurrentTab: _.bind(getRememberPositionForCurrentTab, this)
			});
		}


		/**
		 * Init
		 */
		RememberScrollUI.prototype.init = function(tabId) {

			this._private.tab = tabId;
			this.instance.init();

			//Add the button on load if we have post positions to remember
			var rememberedPosts = this._private.getRememberPositionForCurrentTab();

			if(rememberedPosts.length > 0) {

				var $new_post = $('#new_post', this._private.$postsContainer);

				var $button = $('<div>').addClass('remembr-container').attr('id', $container.attr('id') + '-remembr');
				$imgText = $('<div>').addClass('remembr-text');
				$arrow = $('<div>').addClass('remembr-arrow');

				$button.append($imgText).append($arrow);
				$new_post.append($button);

				$imgText.on('click', _.bind(onButtonClick, this));

				this._private.$remembrButton = $button;
			}
		}

		/**
		 * Destroy
		 */
		RememberScrollUI.prototype.destroy = function() {
			
		}


		//
		// Private
		//

		/**
		 * Tries to find the post position for this tab id
		 */
		function getRememberPositionForCurrentTab() {
			this._private.loadSavedPosts();

			for(var key in this._private.savedPosts) {
				if(key === tab) {
					return [savedPosts[key]];
				}
			}

			//Return all possible positions
			return savedPosts;
		}


		return RememberScrollUI;
	})();

	return Container;

	return function RememberScrollUI(name, $container, $scrollingContainer, pager) {

	


		/**
		 * Start search or show the list of possible positions.
		 */
		function onButtonClick(event) {
			var posts = [];
			if(event.altKey) 
				posts = savedPosts;
			else
				posts = getRememberPositionForCurrentTab();

			if(posts.length === 1) {
				//The current tab id matches a remembered post 
				if(!this.instance.startSearch(posts[0])) {
					alert("Can't start search");
				}
			} else if(posts.length > 1) {
				//Show a list of possible remembr positions
				showPossiblePositions(posts);
			} else {
				//TODO No posts to remember
				alert("No posts to find");
			}
		}

		/**
		 * Add the rotary list
		 */
		function showPossiblePositions(posts) {
			
		}
		
		/**
		 * Tries to find the post position for this tab id
		 */
		function getRememberPositionForCurrentTab() {
			loadSavedPosts();

			for(var key in savedPosts) {
				if(key === tab) {
					return [savedPosts[key]];
				}
			}

			//Return all possible positions
			return savedPosts;
		}
		
		/**
		 * Load saved posts positions.
		 */
		function loadSavedPosts() {
			//Don't use cache in case another page has changed the localStorage
			var obj = Settings.get('last-scroll-' + name, false);
			if(obj === null) return;
			savedPosts = obj;
		}

		//
		// Remember position event
		//

		function onRememberPost(post) {
			
		}

		//
		// RememberScroll events - Update UI
		//

		function onStartSearch() {
			$('.remembr-arrow', this.$remembrButton).addClass('remembr-searching');
			$('.post:not(:first)', $postsContainer).css('opacity', '0.4');
			//Disable interaction/scrolling
		}

		function onNarrowingSearch(info) {
			
		}

		function onGettingPost(info) {
			$('.post:not(:first)', $postsContainer).remove();
		}

		function onEndSearch(info){
			$('.remembr-arrow', $remembrButton).removeClass('remembr-searching');
			$('.post:not(:first)', $postsContainer).css('opacity', '1.0');
			if(info.success) {
				
			} else {
				$remembrButton.show();
				alert('Couldn\'t find the post');
			}
		}

		function onError(error) {
			alert('Couldn\'t search posts');
		}
	}
});