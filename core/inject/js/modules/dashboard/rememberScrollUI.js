define(['logger', 'jquery', 'underscore', 'modules/settings', 'modules/dashboard/rememberScroll', 'lib/utils'], function(Logger, $, _, Settings, RememberScroll, Utils) {
	var DEBUG_DONT_NAVIGATE_AWAY = false;
	var NUMBER_OF_CHANCES = 2;

	var Container = (function() 
	{
		/**
		 * Constructor
		 * @param name String identifying what the posts are
		 * @param $scrollingElement jQuery object that the autoPager monitors
		 * @param $postsContainer jQuery object that contains the posts
		 */
		function RememberScrollUI(name, $postsContainer, $scrollingElement, autoPager) {
			this.name = name;
			this.$scrollingElement = $scrollingElement;
			this.$postsContainer = $postsContainer;
			this.autoPager = autoPager;

			this.rememberScroll = new RememberScroll($postsContainer.selector, $scrollingElement, autoPager);
			//Quick cheat for now
			this.rememberScroll.on('start-search', _.bind(onStartSearch, this));
			this.rememberScroll.on('narrowing-search', _.bind(onNarrowingSearch, this));
			this.rememberScroll.on('getting-post', _.bind(onGettingPost, this));
			this.rememberScroll.on('end-search', _.bind(onEndSearch, this));
			this.rememberScroll.on('error', _.bind(onError, this));

			this.tabId = null;
			this.$remembrButton = null;
			this.possibilitiesButtons = [];
		}

		/**
		 * Hook events and add Remembr button if needed.
		 * @param tabId Host tab's id.
		 */
		RememberScrollUI.prototype.init = function(tabId) {
			this.tabId = tabId;

			this.rememberScroll.init();

			$(window).on('beforeunload', _.bind(this.onPageNavigatingAway, this));

			//Add the button on load if we have post positions to remember
			var allTabsPosts = this.loadAllTabsPosts();

			//if(Object.keys(allTabsPosts).length > 0) {

				//How long should we keep these other tabIds for?
				for(var key in allTabsPosts) {
					if(key == tabId) continue;
					var tab = allTabsPosts[key];

					tab.numberOfChances--;
					if(tab.numberOfChances <= 0) {
						//Remove the tab
						this.removeTabPosts(key);
					}
				}


				var $new_post = $('#new_post', this.$postsContainer);

				var $button = $('<div>').addClass('remembr-container').attr('id', this.$postsContainer.attr('id') + '-remembr');
				var $imgText = $('<div>').addClass('remembr-text');
				var $arrow = $('<div>').addClass('remembr-arrow');

				$button.append($imgText).append($arrow);
				$new_post.append($button);

				$button.append($('<div style="width: 120px; height: 120px;">').addClass('springy-menu'));

				$imgText.on('click', _.bind(this.onRemembrButtonClicked, this));

				this.$remembrButton = $button;
			//}
		}

		/**
		 * Destroy.
		 */
		RememberScrollUI.prototype.destroy = function() {
			$(window).off('beforeunload', _.bind(this.onPageNavigatingAway, this));
		}

		/**
		 * Store the current visible posts for this tab.
		 */
		RememberScrollUI.prototype.onPageNavigatingAway = function() {

			if(this.$scrollingElement.scrollTop() <= 0) return;

			//Find elementFromPoint coords for left_column posts
			var offset = this.$postsContainer.offset();
			var width = this.$postsContainer.width();
			var height = this.$postsContainer.height();
			//Middle of left posts
			var x = offset.left + width / 2;
			//Several y positions to cover all posts
			var $foundPosts = [];
			var savedPosts = {
				//Ids
				posts: [],
				//Page number
				pageNumber: 0,
				//Time of post
				timestamp: 0,
				//Number of chances to open the previous position
				numberOfChances: NUMBER_OF_CHANCES
			};

			for(var i = 10; i < height; i += 20) {
				var y = offset.top + i;
				var $elm = $(document.elementFromPoint(x, y));
				var $post = $elm.closest('.post');

				if($post.attr('id') === 'new_post') {
					break;
				}

				if($post.length > 0) {
					Logger.debug('Found post to save', $post);
					
					$foundPosts.push($post);
					savedPosts.posts.length = 0;
					savedPosts.posts.push($post.attr('data-post-id'));
					Logger.debug(savedPosts.posts[0]);
					break;
				}
			}
			if($foundPosts.length > 0){
				var postTimestamp = getTimestampForPost($foundPosts[0]);
				for(var i = 0; i < 2; i++) {
					var nextPost = $foundPosts[i].next('.post');
					if(nextPost.length > 0) {
						$foundPosts.push(nextPost);
						savedPosts.posts.push($foundPosts[i + 1].attr('data-post-id'));
						Logger.debug(savedPosts.posts[1]);
					} else break;
				}
				//Doesn't have to be accurate we'll be starting search a page or 2 before the saved page in case posts were deleted
				savedPosts.pageNumber = (this.rememberScroll.currentPage.pageNumber > 2 ? this.rememberScroll.currentPage.pageNumber - 2 : 1);
				savedPosts.timestamp = postTimestamp;
				this.savePostsForTab(savedPosts);
			}

			if(DEBUG_DONT_NAVIGATE_AWAY)
				return "Debug";
		}

		/**
		 * Button click event handler.
		 */
		RememberScrollUI.prototype.onRemembrButtonClicked = function(e) {

			if(this.$springyMenu && this.$springyMenu.springyMenu('isVisible')) {
				this.$springyMenu && this.$springyMenu.springyMenu('hide');
				return;
			}

			var forceAllPosibilities = e.altKey;
			var posibilities = [];
			var hasOurTabId = false;
			var ourTabsPosts = null;

			var allTabsPosts = this.loadAllTabsPosts();
			if(forceAllPosibilities || this.tabId == null) 
				posibilities = allTabsPosts;
			else {
				ourTabsPosts = allTabsPosts[this.tabId];
				if(ourTabsPosts) {
					hasOurTabId = true;
					posibilities = [ourTabsPosts];
				} 
				else posibilities = allTabsPosts;
			}

			if(posibilities.length === 1 && hasOurTabId && !forceAllPosibilities) {
				//Add this tab id for event identification
				var possibility = posibilities[0];
				possibility.tabId = this.tabId;
				this.rememberScroll.startSearchFor(possibility);
			} else if(posibilities.length > 1 || forceAllPosibilities || !hasOurTabId) {
				this.showPossibleSearchPositions(posibilities);
			} else {
				alert("No posts to search for");
			}
		}

		/**
		 * Add the ring of buttons arround the Remembr button to load different tabs' positions.
		 * @param possibleSearchPositions Array of all possibilities.
		 */
		RememberScrollUI.prototype.showPossibleSearchPositions = function(posibleSearchPositions) {
			$('.springy-menu', this.$remembrButton).empty();
			if(this.$springyMenu) {
				this.$springyMenu.springyMenu('destroy');
			}

			var $lastButton = null;
			var i = 1;
			for(var key in posibleSearchPositions) {
				var possibility = posibleSearchPositions[key];

				$lastButton = this.addPossibleSearchPositionButton(i).click(_.bind(function() {
					//Add this tab id for event identification
					possibility.tabId = key;
					this.rememberScroll.startSearchFor(possibility);
					this.$springyMenu.springyMenu('hide');
				}, this));
				i++;
			}

			//Add clear remembered positions button
			var $clearButton = this.addPossibleSearchPositionButton('x').click(_.bind(function() {
				this.forgetAllSearchPositions();
				this.$springyMenu.springyMenu('hide');
			}, this));

			if(Object.keys(posibleSearchPositions).length <= 0) {
				$lastButton = $clearButton;
			}

			//Make sure notransition has been removed from the class
			_.defer(_.bind(function() {
				this.$springyMenu = $('.springy-menu', this.$remembrButton).springyMenu({
					'radius'	 : 70.0,
					'startAngle' : 145.0,
					'angle'		 : 80.0
					,'location'	 : {'left': $lastButton.position().left, 'top': $lastButton.position().top }
				});

				this.$springyMenu.springyMenu('show');
			}, this));
		}

		/**
		 * Add the button at the correct distance and angle from the Remembr button.
		 * @param index Current index out of posibilities.
		 */
		RememberScrollUI.prototype.addPossibleSearchPositionButton = function(value) {
			var $springyMenuContainer = $('.springy-menu', this.$remembrButton);
			var $button = $('<div>').css('display','none').addClass('item').addClass('notransition').text(value);
			$springyMenuContainer.append($button);

			$button.css('left', $springyMenuContainer.width() / 2 - $button.width() / 2);
			$button.css('top', $springyMenuContainer.height() / 2 - $button.height() / 2);

			_.defer(function(){ $button.css('display','block').removeClass('notransition'); });
		
			return $button;
		}

		/**
		 * Show confirmation and then delete all stored search positions
		 */
		RememberScrollUI.prototype.forgetAllSearchPositions = function() {
			if(confirm('Are you sure you want to forget all remembered posts?')) {
				Settings.set('tabs-posts-kind-' + this.name, {});
				return true;
			}

			return false;
		}


		/**
		 * Load specific posts for this tab, all tabs if this tab doesn't exist or force all tabs.
		 * @param forceAllTabs Even if there is a matching tab id load posts for all tabs.
		 */
		RememberScrollUI.prototype.getRememberedPostsForThisTab = function(forceAllTabs) {
			var allTabsPosts = this.loadAllTabsPosts();

			if(forceAllTabs || this.tabId == null) return allTabsPosts;

			var tabPosts = allTabsPosts[this.tabId];
			if(!tabPosts) return allTabsPosts; 

			return [tabPosts];
		}

		/**
		 * Remove entry for tabId. Remove the remember button if no tabs left
		 * @param tabId Id of tab.
		 */
		RememberScrollUI.prototype.removeTabPosts = function(tabId) {
			//Remove the tab
			var allTabs = this.loadAllTabsPosts();
			if(!allTabs[tabId]) return;
			delete allTabs[tabId];
			Settings.set('tabs-posts-kind-' + this.name, allTabs);

			//Remove button if needed
			/*if(Object.keys(allTabs).length <= 0) {
				this.$remembrButton.remove();
			}*/

			return allTabs;
		}

		/**
		 * Save posts for tabId. TODO Settings locking
		 * @param Posts Array of post information to help find the post in the future.
		 */
		RememberScrollUI.prototype.savePostsForTab = function(posts) {
			if(!this.tabId) return false;

			var allTabs = this.loadAllTabsPosts();

			allTabs[this.tabId] = posts;

			Settings.set('tabs-posts-kind-' + this.name, allTabs);
			return true;
		}

		/**
		 * Load all tabs' posts from settings.
		 */
		RememberScrollUI.prototype.loadAllTabsPosts = function() {
			//Don't use cache in case another page has changed the localStorage
			var obj = Settings.get('tabs-posts-kind-' + this.name, false);
			if(obj === null) obj = {};
			return obj;
		}

		/**
		 * Get timestamp for post.
		 */
		function getTimestampForPost($post) {
			//Annoyingly formatted timestamp is in the little corner permalink "View post - [Today, Wednesday,...] 06:30am"
			var permalink = $('a.permalink:first', $post);
			var crapTimestamp = permalink.attr('title').replace(/^.* \- /,'');//Test for /.* \- (.*)/
			var timestamp = Utils.getTimestampFromTumblrsAnnoyingFormat(crapTimestamp);
			return timestamp;
		}

		//
		// RememberScroll events - Update UI
		//

		function onStartSearch() {
			$('.remembr-arrow', this.$remembrButton).addClass('remembr-searching');
			$('.post:not(:first)', this.$postsContainer).css('opacity', '0.4');
			//Disable interaction/scrolling
			$('body').css('overflow', 'hidden');
		}

		function onNarrowingSearch(info) {
		
		}

		function onGettingPost(info) {
			$('.post:not(:first)',  this.$postsContainer).remove();
		}

		function onEndSearch(info){
			$('.remembr-arrow',  this.$remembrButton).removeClass('remembr-searching');
			$('.post:not(:first)',  this.$postsContainer).css('opacity', '1.0');
			//Restore interaction/scrolling
			$('body').css('overflow', 'visible');

			if(info.success) {
				//Remove tabId from posts
				this.removeTabPosts(info.tabId)
			} else {
				if(info.retrying) {
					Logger.info('Retrying search from start');
				} else {
					alert('Couldn\'t find the post');
				}
			}
		}

		function onError(error) {
			alert('Couldn\'t search posts');
		}

		return RememberScrollUI;
	})();
	return Container;
});