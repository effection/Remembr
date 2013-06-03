/**
 * Remember what posts are in view on the dashboard in case the tab is accidentally closed.
 *
 * Settings -
 *
 * Events	-
 *			start-search
 *			narrowing-search	{between: start, end}
 *			getting-post		{page}
 *			end-search			{success, tabId, [retrying]}
 *			error				{code, message, tabId}
 */

define(['logger', 'jquery', 'underscore', 'eventEmitter', 'lib/utils'], function(Logger, $, _, EventEmitter, Utils) {
	var FIND_EXACT_POST_RETRY_COUNT = 8;
	var Container = (function() {
		var selector;
		var $scrollContainer;
		var pager;

		//States
		var state = {
			onFailStartFullSearch: false,

			isSearchingForPost: false,
			nearestPageFound: false,
			narrowingSearch: false,

			tryToGoToExactPostRetries: FIND_EXACT_POST_RETRY_COUNT
		};

		var skipBy = {
			count: 5
		};

		var binarySearch = {
			start: 0,
			end: 0,

			args: {}
		};

		function RememberScroll(postsContainerSelector, $scrollingContainer, containerPager) {
			selector = postsContainerSelector;
			$scrollContainer = $scrollingContainer;
			pager = containerPager;

			//Bind private functions that need this.
			pageLoaded = _.bind(pageLoaded, this);//Needed for trigger()
			searchForPost = _.bind(searchForPost, this);//Needed for trigger()
			startNarrowingDownSearch = _.bind(startNarrowingDownSearch, this);//Needed for trigger(); this.currentPage
			binarySearchForTimestamp = _.bind(binarySearchForTimestamp, this);//Needed for trigger();
			getPagesUntilPastTimestamp = _.bind(getPagesUntilPastTimestamp, this);//Needed for this.currentPage

			this.showingFromPageNumber = 1;
		}

		_.extend(RememberScroll.prototype, EventEmitter);

		/**
		 * Hook events.
		 */
		RememberScroll.prototype.init = function() {
			//Hook window leave and page load events
			pager.on('after', pageLoaded);

			//Get the current page.
			this.currentPage = decodePageNumber(pager.getNextPageUrl());
			this.currentPage.pageNumber--;
		}

		/**
		 * Unhook events.
		 */
		RememberScroll.prototype.destroy = function() {
			pager.off('after', pageLoaded);
		}

		/**
		 * Start looking for posts
		 */
		RememberScroll.prototype.startSearchFor = function(posts) {

			postsToSearchFor = posts;

			state.nearestPageFound = false;
			state.narrowingSearch = false;
			state.tryToGoToExactPostRetries = FIND_EXACT_POST_RETRY_COUNT;

			skipBy.count = 5;

			this.trigger('start-search');

			//If the last search was an immediate search and it failed try a full search
			if(!state.onFailStartFullSearch) {

				//Check if we have already loaded enough posts to find the one we're looking for
				var $lastPost = $('.post:last', $(selector));
				if($lastPost.length > 0) {
					var lastPostTimestamp = getTimestampForPost($lastPost);

					//Is last post older than the saved post
					if(lastPostTimestamp <= postsToSearchFor.timestamp) {
						//posts already loaded
						state.isSearchingForPost = true;
						state.narrowingSearch = true;
						state.nearestPageFound = true;
						state.onFailStartFullSearch = true;
						searchForPost();
						return;
					}
				}
			}

			state.onFailStartFullSearch = false;

			//Set the page to begin a little before the saved page number
			pager.setNextPageToLoad(nextPageUrl((postsToSearchFor.pageNumber > 5 ? postsToSearchFor.pageNumber - 5 : 1)), function() {
				state.isSearchingForPost = true;
				pager.loadNextPage(false);
			});
		}

		/**
		 * After page loaded.
		 */
		function pageLoaded(nextPage, newPosts) {
			this.currentPage = decodePageNumber(nextPage);
			this.currentPage.pageNumber--;

			if(state.isSearchingForPost) {

				//Check for error
				if(!state.nearestPageFound && newPosts.length <= 0) {
					state.isSearchingForPost = false;
					this.trigger('error', {code: 1, message: 'No posts found', tabId: postsToSearchFor.tabId});
					return;
				}

				//Binary searching/getting exact post after binary search
				if(state.narrowingSearch) {
					if(state.nearestPageFound) {
						//Finding exact post
						searchForPost();
					} else {
						//Finding nearest page
						binarySearchForTimestampCallback(
							newPosts, 
							binarySearch.args.keyTimestamp,  
							binarySearch.args.minPageNumber,  
							binarySearch.args.midPageNumber,  
							binarySearch.args.maxPageNumber);
					}
				} else {
					//Get the timestamp of the first post of the page to see if it is close to the one we're looking for
					var newPostTimestamp = getTimestampForPost(newPosts[0]);

					if(!skipBy) 
						skipBy = {count: 5};

					//Check current timestamp against target and skip ahead by X pages if we're not there yet
					if(getPagesUntilPastTimestamp(newPostTimestamp, skipBy)) {
						//Gone past timestamp
						startNarrowingDownSearch(this.currentPage.pageNumber - skipBy.count);
					}
				}
			}
		}

		/**
		 * Look for exact post, loading new pages if needed until limit.
		 */
		function searchForPost() {
			if(state.tryToGoToExactPostRetries > 0 && tryToGoToExactPost()){
				//Success
				Logger.info('Found exact post');
				this.trigger('end-search', {success: true, tabId: postsToSearchFor.tabId});
				state.isSearchingForPost = false;
			} else {
				//Load next page for a limitted number of tries
				state.tryToGoToExactPostRetries--;

				if(state.tryToGoToExactPostRetries <= 0) {
					Logger.info('Failed to find exact post');
						
					this.trigger('end-search', {success: false, retrying: state.onFailStartFullSearch, tabId: postsToSearchFor.tabId});

					state.isSearchingForPost = false;

					if(state.onFailStartFullSearch) {
						this.startSearchFor();
					}
				} else {
					this.showingFromPageNumber = this.currentPage.pageNumber + 1;

					pager.setNextPageToLoad(nextPageUrl(this.currentPage.pageNumber + 1), function() {
						pager.loadNextPage(true);
					});
				}
			}
		}

		/**
		 * Keep loading pages until we are past the target timestamp, exponentially skipping
		 */
		function getPagesUntilPastTimestamp(currentPageTimestamp, skipBy) {
			if(currentPageTimestamp > postsToSearchFor.timestamp) {
				//Skip ahead by X number of pages
				skipBy.count *= 2;
				pager.setNextPageToLoad(nextPageUrl(this.currentPage.pageNumber + skipBy.count), function() {
					pager.loadNextPage(false);
				});
				return false;
			} else {
				//We have loaded pages with a time before what we are looking for
				return true;
			}
		}

		/**
		 * Start binary search for nearest page.
		 */
		function startNarrowingDownSearch(previousCurrentPage) {
			//Track how long it takes for debugging
			state.narrowingSearch = true;

			//Emit event for UI updating
			this.trigger('narrowing-search', {between: {start: previousCurrentPage, end: this.currentPage.pageNumber}});

			binarySearch.start = new Date().getTime();
			binarySearchForTimestamp(postsToSearchFor.timestamp, previousCurrentPage, this.currentPage.pageNumber);
		}

		/**
		 * Search for page with closest timestamp to the one we're looking for by binary search.
		 */
		function binarySearchForTimestamp(keyTimestamp, minPageNumber, maxPageNumber) {

			//Found condition: post is somewhere between these pages
			if (maxPageNumber < minPageNumber) {
				binarySearch.end = new Date().getTime();
				Logger.debug('Found page at ' + maxPageNumber + ' in ' + ((binarySearch.end - binarySearch.start) / 1000) + 's.');

				//Emit event for final stage to update UI
				this.trigger('getting-post', {page: maxPageNumber});

				//Account for deleted posts, so pull page number back 1 (gives room for 10 deletions in timeline)
				this.showingFromPageNumber = (maxPageNumber > 1 ? maxPageNumber - 1 : 0);

				//Load this page into the container
				pager.setNextPageToLoad(nextPageUrl(this.showingFromPageNumber), function() {
					state.nearestPageFound = true;
					pager.loadNextPage(true);
				});
			} else {

				// calculate midpoint to cut set in half
				var midPageNumber = Math.floor( (minPageNumber + maxPageNumber ) / 2);

				//Store the args to pass to the callback after page load
				binarySearch.args = {
					minPageNumber: minPageNumber,
					midPageNumber: midPageNumber,
					maxPageNumber: maxPageNumber,
					keyTimestamp: keyTimestamp
				};

				//Load mid page
				pager.setNextPageToLoad(nextPageUrl(midPageNumber), function() {
					pager.loadNextPage(false);
				});
			}
		}

		/**
		 * After retrieving middle page, return to here.
		 */
		function binarySearchForTimestampCallback(posts, keyTimestamp, minPageNumber, midPageNumber, maxPageNumber) {
			var timestampOfMidPageNumber = getTimestampForPost(posts[0]);
			Logger.debug('Binary search timestamp difference: ' + (timestampOfMidPageNumber - keyTimestamp) + 's');

			// three-way comparison
			if (timestampOfMidPageNumber < keyTimestamp) {
				// midway timestamp is older (smaller) than the keyTimestamp so search the lower half
				return binarySearchForTimestamp(keyTimestamp, minPageNumber, midPageNumber-1);
			} else {
				// midway timestamp is younger (bigger) than the keyTimestamp so search upper half
				return binarySearchForTimestamp(keyTimestamp, midPageNumber+1, maxPageNumber);
			}
		}

		/**
		 * One of the posts should exist now in the container.
		 */
		function tryToGoToExactPost() {
			var $container = $(selector);
			for(var i = 0; i < postsToSearchFor.posts.length; i++) {
				var $post = $('div[data-post-id="' + postsToSearchFor.posts[i] + '"]', $container);
				if($post.length > 0) {

					$scrollContainer.animate({
						 scrollTop: $post.offset().top
					 }, 2000);
					return true;
				}
			}
			return false;
		}

		/**
		 * Get timestamp for post.
		 */
		function getTimestampForPost($post) {
			//Annoyingly formatted timestamp is in the little corner permalink "View post - [Today, Wednesday,...] 06:30am"
			var permalink = $('a.post_permalink:first', $post);
			var crapTimestamp = permalink.attr('title').replace(/^.* \- /,'');//Test for /.* \- (.*)/
			var timestamp = Utils.getTimestampFromTumblrsAnnoyingFormat(crapTimestamp);
			return timestamp;
		}

		/**
		 * Generate the url for the next page number.
		 */
		function nextPageUrl(pageNumber) {
			return urlBase + pageNumber;
		}

		/**
		 * Turn /dashboard/2/6548899987 into base url /dashboard/ and page number 2
		 */
		function decodePageNumber(pageUrl) {
			var regx = /(\/[a-zA-Z0-9_]+\/)([0-9]+)\/*/;/*Fix for WebMatrix incorrect highlighting*/
			var match = regx.exec(pageUrl);
			if(match === null || match.length < 3)  return -1;

			urlBase = match[1];
			return {urlBase: urlBase, pageNumber: parseInt(match[2])};
		}

		return RememberScroll;
	})();

	return Container;
});