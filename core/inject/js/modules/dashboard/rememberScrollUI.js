define(['logger', 'jquery', 'underscore', 'modules/dashboard/rememberScroll'], function(Logger, $, _, RememberScroll) {
	return function RememberScrollUI(name, $container, $scrollingContainer, pager) {

		this.canResume = false;

		this.instance = new RememberScroll(name, $container.selector, $scrollingContainer, pager);
		this.instance.on('start-search', onStartSearch);
		this.instance.on('narrowing-search', onNarrowingSearch);
		this.instance.on('getting-post', onGettingPost);
		this.instance.on('end-search', onEndSearch);
		this.instance.on('error', onError);

		var hidden = false;
		var $postsContainer = $('ol.inception-posts', $container);
		var $remembrButton = null;

		this.init = function() {
			this.instance.init();
			this.canResume = this.instance.canResume();

			if(this.canResume) {
				var self = this;

				var $new_post = $('#new_post', $postsContainer);

				var $button = $('<div>').addClass('remembr-container').attr('id', $container.attr('id') + '-remembr');
				$imgText = $('<div>').addClass('remembr-text');
				$arrow = $('<div>').addClass('remembr-arrow');

				$button.append($imgText).append($arrow);//.css('top', $new_post.offset().top + 28).css('left', $new_post.offset().left - 134);
				$new_post.append($button);//$('#container').append($button);

				$imgText.on('click', function() {
					if(self.instance.canResume()) {
						self.instance.startSearch();
					}
				});

				$remembrButton = $button;
			}

			 /*$scrollingContainer.scroll(function() {
			 	if($(this).scrollTop() === 0 && hidden) {
			 		$remembrButton.fadeIn();
					hidden = false;
			 	} else if(!hidden) {
			 		hidden = true;
					$remembrButton.fadeOut("fast");
			 	}
			 });*/
		}

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