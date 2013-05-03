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

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;
	if (!event.data) return;
	var data = JSON.parse(event.data);

	switch(data.type) {
		case "getTabId":
			chrome.extension.sendMessage({type: "getTabId"}, function(response) {
				response.type = "tabId";
				event.source.postMessage(JSON.stringify(response), event.origin);
			});
			break;
	}
});

injectRequireJs(chrome.extension.getURL('core/inject/js/lib/require.js'), chrome.extension.getURL('core/inject/js/main'));