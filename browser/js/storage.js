/**
 * Chrome specific storage settings
 */

define([], function() {
	var storage = localStorage;

	var module = {
		init: init,

		get: get,
		set: set,

		key: key,
		length: length
	};

	
	//Cache left over from chrome.extension.storage.sync for syncronous getting of settings
	var cache = {};

	function init() {
		
	}

	function get(key) {
		if(cache[key]) return cache[key];
		var v = storage.getItem(key); 
		if(!v) {
			cache[key] = null;
			return null;
		}

		var obj = JSON.parse(v);
		cache[key] = obj;
		return obj;
	}

	function set(key, value) {
		cache[key] = value;
		storage.setItem(key, JSON.stringify(value));
	}

	function key(i) {
		return storage.key(i);
	}

	function length() {
		return storage.length;
	}

	return module;
})