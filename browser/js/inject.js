

$(document).ready(function () {
    Tumblr.AutoPaginator.stop();
    $('body').scrollTop(0);
    //
    // Add classes to a few objects for styling / ease
    //
    $('body').addClass('inception');
    $('#left_column').addClass('post-column'); //.addClass('nano');
    $('#left_column #posts').addClass('inception-posts'); //.addClass('content');
    //$(".nano").nanoScroller();

    //Move #sidebar_footer_nav into the right_column since it normally sits fixed underneath it
    $('#sidebar_footer_nav').insertBefore('#right_column > .clear').removeClass('pinned_sidebar_footer');
    $('#sidebar_footer_nav > .sidebar_nav').css('float', 'none');

    //
    // Manage showing and hiding header for maximum screen space
    //
    var headerVisibility = new HeaderVisibilityController();

    //
    // Manage showing the extra column of posts
    //
    var extraPostsColumn = new ExtraPostsColumnController();

    //
    // Hook the home button to open the second column and load the first page of posts always
    //
    $('#home_button > a').attr('href', '#');
    $('#home_button > a').click(function (e) {
        if (lock_opening_double_column) return;

        if (unread_posts_count > 0) {
            if (extraPostsColumn.state === 'hidden')
                extraPostsColumn.setVisibility(true);
        } else
            extraPostsColumn.toggle();

        //Don't need to reload
        if (unread_posts_count === 0) return;

        //Check if it's just opened and need to load new posts
        if (extraPostsColumn.state === 'visible') {

            //Load the first page
            apExtraLeftColumn.setNextPage('/dashboard/1', function () {
                //Empty all previous posts
                $('.inception-posts', $extraLeftColumn).empty();
                $('.inception-posts', $extraLeftColumn).append($createPostsControl.clone());

                //Set the Notification poller to check for posts from now - on success
                Tumblr.Thoth.update_timestamp(new Date().getTime() / 1000);
                //Hide new posts count
                document.title = (document.title.indexOf(')') != -1 ? document.title.split(')')[1] : document.title);
                $('.new_post_notice_container').hide();
                unread_posts_count = 0;
            });

        }

        e.stopPropagation();
    });

    //
    // Get original column
    //
    var $originalLeftColumn = $('#left_column');
    var $createPostsControl = $($('#left_column #posts > .post.is_mine')[0]);

    //
    // Create second column
    //
    var $buildColumn = $('<div id="inception_left_column" class="post-column cut-off" style=""><ol id="posts" class="inception-posts"></ol></div>');
    $('.inception-posts', $buildColumn).append($createPostsControl.clone());
    $buildColumn.insertAfter($originalLeftColumn);
    var $extraLeftColumn = $('#inception_left_column');

    //
    // Track scrolling on main column to hide/show header
    //
    var swOriginalLeftColumn = new ScrollWatcher($originalLeftColumn);
    swOriginalLeftColumn.on('scroll', function (e) {
        if (headerVisibility.showingNotifications) return;

        if (e.dir == 'down' && headerVisibility.state === 'visible') {
            headerVisibility.setVisibility(false);
        } else if (e.dir == 'up' && headerVisibility.state === 'hidden') {
            headerVisibility.setVisibility(true);
        }
    });

    var swExtraLeftColumn = new ScrollWatcher($extraLeftColumn);
    swExtraLeftColumn.on('scroll', function (e) {
        if (headerVisibility.showingNotifications) return;

        if (e.dir == 'down' && headerVisibility.state === 'visible') {
            headerVisibility.setVisibility(false);
        } else if (e.dir == 'up' && headerVisibility.state === 'hidden') {
            headerVisibility.setVisibility(true);
        }
    });

    function dispatchWheelEvent_Chrome($el, delta) {
        var el = $el[0];
        var evt = document.createEvent("MouseEvents");
        evt.initEvent('mousewheel', true, true);
        evt.wheelDelta = delta;
        el.dispatchEvent(evt);
    }

    //
    // Any scrolling outside of the scrolling boxes should scroll the last focused box
    //DOMMouseScroll
    $(document).bind('mousewheel', function (e) {
        var targetIsChildOfPostColumn = ($(event.target).closest('.post-column').length > 0);
        console.log($(event.target).attr('id') + " - " + e.originalEvent.wheelDelta);
        //User is scrolling specific column
        if (targetIsChildOfPostColumn) return;
        console.log('Forwarding');
        console.log('');
        //Decide which column we should scroll
        if (extraPostsColumn.extraFocused) {
            //$extraLeftColumn.trigger("mousewheel", e);
        } else {
            //$originalLeftColumn.trigger("mousewheel", e);
            //dispatchWheelEvent_Chrome($('#posts', $originalLeftColumn), e.originalEvent.wheelDelta);
        }
    }).keydown(function (e) {

    });

    //
    // AutoPaginate #left_column
    //
    var aporiginalLeftColumn = new AutoPaginatorContainer($originalLeftColumn, '/dashboard/2');
    aporiginalLeftColumn.start();

    //
    // AutoPaginate #inception_left_column
    //
    var apExtraLeftColumn = new AutoPaginatorContainer($extraLeftColumn, '/dashboard/1');
    apExtraLeftColumn.start();

    //
    // Hook all polled notifications
    //
    hookNotifications();

    //
    // New unread posts shows the top bar temporarily
    //
    var unread_posts_count = 0;
    var lock_opening_double_column = false;
    Tumblr.Thoth.on('unread', function (count, prev) {
        lock_opening_double_column = true;
        if (count > 0 && count !== prev) {
            unread_posts_count = count;

            if (headerVisibility.state === 'hidden') {
                headerVisibility.setVisibility(true);
                headerVisibility.showingNotifications = true;

                setTimeout(function () {
                    headerVisibility.setVisibility(false);
                    headerVisibility.showingNotifications = false;
                }, 4000);
            }
        }
        lock_opening_double_column = false;
    });

    //Make sure it's at the damn top
    $('body').scrollTop(0);
});

/**
 * Hook tumblr notifications to trigger events.
 */
function hookNotifications() {
    if (!Tumblr.Thoth) return;

    var original_parse_notifications = Tumblr.Thoth.parse_notifications;
    var original_parse_unread = Tumblr.Thoth.parse_unread;
    var original_parse_inbox = Tumblr.Thoth.parse_inbox;

    Tumblr.Thoth.last_unread_count = 0;

    Tumblr.Thoth.parse_unread = function (data) {
        original_parse_unread(data);

        if (typeof data.unread !== 'number')
            return;
        this.trigger('unread', data.unread, this.last_unread_count);
        this.last_unread_count = data.unread;
    }
}

/**
 * Handle the state of the header.
 */
function HeaderVisibilityController() {
    this.state = 'visible';
    this.showingNotifications = false;

    var $els = $('#header, #tabs_outter_container, #logo');

    /**
    * Slide up and down the header and store its state.
    */
    this.setVisibility = function (vis) {
        if (vis) {
            $('#content').removeClass('scrolled-down');
            $els.slideDown(500, function () {
                
            });
        } else {
            $('#content').addClass('scrolled-down');
            $els.slideUp(400, function () {
                
            });
        }
        this.state = (vis ? 'visible' : 'hidden');
        $els.data('slide-state', this.state);
    }
}

function ExtraPostsColumnController() {
    this.state = ($('#container').hasClass('double-column') ? 'visible' : 'hidden');
    this.extraFocused = false;

    this.setVisibility = function(vis) {
        if(vis) {
            $('#container').addClass('double-column');
        } else {
            $('#container').removeClass('double-column');
        }
        this.state = (vis ? 'visible' : 'hidden');
    }

    this.toggle = function () {
        this.setVisibility(!(this.state === 'visible'));
    }
}

/**
 * Emit events on scroll for element.
 */
function ScrollWatcher(el) {
    var lastScrollTop = 0;

    var pub = {
        dir: 'down'
    };
    _.extend(pub, Backbone.Events)

    el.scroll(function (e) {
        var st = $(this).scrollTop();
        if (st < lastScrollTop) pub.dir = 'up';
        else pub.dir = 'down';

        if (st !== lastScrollTop) {
            lastScrollTop = st;
            pub.trigger('scroll', { dir: pub.dir, e: e });
        }
    });

    return pub;
}

/**
 * Custom AutoPaginator - slightlyyyyy modified version of Tumblr's! 
 * 
 * exports should be an empty object so the paginator isn't a static global instance
 */
function AutoPaginatorContainer($scrollContainer, startPage) {
    var AutoPaginator = {
        start: function () {
            retries = 3;
            this.interval = setInterval(poll, 123)
        },
        stop: function () {
            loading_next_page = false;
            clearInterval(this.interval)
        },
        setNextPage: function (page, cb) {
            if (loading_next_page) {
                this.on('after', function (page) {
                    next_page = page;
                    if(typeof(cb) === 'function') cb();
                });
                return false;
            } else {
                next_page = page;
                if(typeof(cb) === 'function') cb();
                return true;
            }
        }
    };
	_.extend(AutoPaginator, Backbone.Events);


	var retries = 3;
	var loading_next_page = false;
	var next_page = startPage;

	function in_viewport(el) {
		if (typeof el === 'undefined' || el === null)
			return false;
        var top = $(el).position().top;
        var scroll = $scrollContainer.scrollTop();
        var viewport_height = $scrollContainer.height();
        /*
		var top = el.offsetTop;
		var scroll = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		var viewport_height = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight;
        */
		return (top < (scroll + viewport_height))
	}
	function poll() {
		if (!next_page) {
			if ($('#auto_pagination_loader').is(':visible')) {
				$('#auto_pagination_loader').hide()
			}
			AutoPaginator.stop();
			return
		}
		var posts;
		if (next_page && !loading_next_page && (posts = $('.inception-posts > .post', $scrollContainer)/*$('#posts > .post')*/) && posts.length > 0 && (((posts.length >= 3) && in_viewport(posts[posts.length - 4])) || ((posts.length < 3) && in_viewport(posts[posts.length - 1])))) {
			loading_next_page = true;
			_before_auto_pagination();
			AutoPaginator.trigger("before", next_page);
			$('#auto_pagination_loader_loading').show();
			$('#auto_pagination_loader_failure').hide();
			load_next_page()
		}
	}
	function load_next_page() {
		retries--;
		var req = $.ajax({url: next_page,type: 'get'});
		req.done(function(html) {
			process_response(html);
			var next_page_header = req.getResponseHeader('X-next-page');
			if (next_page_header) {
				next_page = next_page_header
			} else {
				next_page = html.match('id="next_page_link" href="') ? html.split('id="next_page_link" href="')[1].split('"')[0] : false
			}
		});
		req.fail(function() {
			if (retries)
				load_next_page();
			else
				give_up()
		})
	}
	function process_response(html) {
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
		$('.inception-posts', $scrollContainer).append(new_posts);
		track();
		loading_next_page = false;
		setTimeout(function() {
			if (typeof window.after_auto_paginate == 'function')
				after_auto_paginate();
			_after_auto_pagination();
			AutoPaginator.trigger("after", next_page)
		}, 0)
	}
	function give_up() {
		AutoPaginator.stop();
		$('#auto_pagination_loader_loading').hide();
		$('#auto_pagination_loader_failure').show()
	}
	function track() {
		next_page = next_page.replace(/https?:\/\/.*?\//, '/');
		if (next_page.indexOf('/dashboard') === 0) {
			next_page = next_page.substring(0, next_page.lastIndexOf('/'))
		}
		if (window._gaq !== undefined) {
			var tracking_url = tumblr_custom_tracking_url ? tumblr_custom_tracking_url : next_page;
			_gaq.push(['_trackPageview', tracking_url])
		}
		if (window.__qc) {
			__qc.qpixelsent = [];
			__qc.firepixel({qacct: "p-19UtqE8ngoZbM"})
		}
		if (typeof (COMSCORE) !== 'undefined') {
			COMSCORE.beacon({c1: "2",c2: "15742520"})
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
