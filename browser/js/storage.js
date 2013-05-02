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

	function init() {
		
	}

	function get(key) {
		var v = storage.getItem(key); 
		return JSON.parse(v);
	}

	function set(key, value) {
		var obj = JSON.stringify(value);
		storage.setItem(key, obj);
		return obj;
	}

	function key(i) {
		return storage.key(i);
	}

	function length() {
		return storage.length;
	}

	return module;
})