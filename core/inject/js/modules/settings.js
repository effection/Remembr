define(['storage'], function(Storage) {
	var module = {
		get: get,
		set: set,
		all: all
	};

	var prexifx = "inception-";
	var cache = {};

	function get(key, useCache) {
		if(typeof(useCache) === 'undefined') useCache = true;
		if(cache[key] && useCache) return cache[key];

		var obj = Storage.get(prexifx + key);
		cache[key] = obj;
		return obj;
	}

	function set(key, val) {
		cahce[key] = Storage.set(prexifx + key, val);
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

		set('rememberScroll', {
			enabled: true
		});

		set('defaultsSet', true);
	}

	init();

	return module;
});