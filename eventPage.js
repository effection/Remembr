chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.type) {
			case "getTabId": 
				sendResponse({id: sender.tab.id});
				break;
		}	
});