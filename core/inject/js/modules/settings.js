define(['storage'], function(Storage) {
	var module = {
		get: get,
		set: set,
		all: all
	};

	var prexifx = "inception-";

	function get(key) {
		return Storage.get(prexifx + key);
	}

	function set(key, val) {
		Storage.set(prexifx + key, val);
	}

	function all() {
		var items = [];
		var l = Storage.length();
		for(var i = 0; i < l; i++) {
			var key = Storage.key(i);
			if(key.indexOf(prefix) == 0) 
				items.push(Storage.get(key));
		}
		return items;
	}

	function init() {
		defaults();
		if(!get('defaultsSet')) {
			defaults();
		}
	}

	function defaults() {

		set('hideHeaderOnScroll', {
			enabled: true,
			upwardScrollShowThreshold: 50
		});

		set('collapsableHeader', {
			enabled: true,
			showOnNotification: true,
			hideDelay: 4000,
			reshowDelay: 60 * 1000
		});

		set('newPostsColumn', {
			enabled: true
		});

		set('collapsableRightColumn', {
			enabled: true
		});

		set('rememberScroll', {
			enabled: true
		});

		set('defaultsSet', true);
	}

	init();

	return module;
});