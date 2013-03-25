function injectScript(script, name) {
	var s = document.createElement('script');
	s.text = script + "\n//@ sourceURL=" + name + ".js";
	(document.head||document.documentElement).appendChild(s);
}

function injectRequireJs(url, main, load) {
	var s = document.createElement('script');
	s.src = url;
	s.onload = load || null;
	s.setAttribute('data-main', main);
	(document.head||document.documentElement).appendChild(s);
}

//injectScript("jQuery.holdReady(true);debugger;", "debugger");
injectRequireJs(chrome.extension.getURL('core/inject/js/lib/require.js'), chrome.extension.getURL('core/inject/js/main'));