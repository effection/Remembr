define(['jquery'], function($) {
	var methods = {
		init : function( options ) { 
			var settings = $.extend( {
				'location'	: {top:0, left:0},
				'radius'	: 100.0,
                'startAngle': 135.0,
				'angle'		: 90.0
			}, options);

			this.data('springyMenu', {
				visible: false
			});

			//Get .items
			var $menuItems = $('.item', this);

			var oneOverCount = $menuItems.length <= 1 ? 1.0 : (1.0 / ($menuItems.length - 1));

			//Calculate angle and distances
			for(var index = 0; index < $menuItems.length; index++) {
				var indexOverCount = index * oneOverCount;
				var rad = (settings.startAngle + (1.0 - indexOverCount) * settings.angle) * Math.PI/180;

				/**

				Affine transformation matrix

				costheta = Math.cos(rad),
				sintheta = Math.sin(rad);

				var a = costheta,
					b = sintheta,
					c = -sintheta,
					d = costheta;

					[a, c, 0],
				    [b, d, 0],
				    [0, 0, 1]

				**/

				var x = settings.radius  * Math.cos(rad);
				var y = settings.radius * Math.sin(rad);

				var initialPosition = $($menuItems[index]).position();

				var animateTo = {
					left: initialPosition.left + x, 
					top: initialPosition.top + y
				};
				//Store final positions
				$($menuItems[index]).data('springyMenu', {
					openPosition : animateTo,
					closedPosition: initialPosition
				});
			}

			return $(this);
		},

		destroy: function() {
			$(this).removeData('springyMenu');
			return $(this);
		},

		isVisible: function() {
			return $(this).data('springyMenu').visible;
		},

		show : function( ) {
			var $menuItems = $('.item', this);
			$menuItems.each(function() {
				var $this = $(this);
				var pos = $this.data('springyMenu').openPosition;
				//$this.css('display', 'block');
				$this.css('left', pos.left);
				$this.css('top', pos.top);

				$this.removeClass('hide-menu-item');
				$this.addClass('show-menu-item');
			});

			$(this).data('springyMenu').visible = true;

			return $(this);
		},

		hide : function( ) { 
			var $menuItems = $('.item', this);
			$menuItems.each(function() {

				var $this = $(this);

				var pos = $this.data('springyMenu').closedPosition;
				$this.css('left', pos.left);
				$this.css('top', pos.top);
				
				$this.removeClass('show-menu-item');
				$this.addClass('hide-menu-item');


			});

			$(this).data('springyMenu').visible = false;

			return $(this);
		}
	};

	$.fn.springyMenu = function( method ) {
    
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.springyMenu' );
		}    
	}

	return {};
});