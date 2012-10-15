window.addEventListener ("load", urban3pUpdateKarmaRepeatedly, false);

var username = '';

function urban3pLeftClick(e) {
	if (e.button == 0) {
		if (username) {
			urban3pUpdateKarma();
		} else {
			urban3pLoadProfile(e);
		}
	}
}

function urban3pUpdateKarma() {
	document.getElementById("urban3p-label").value = '…';

	var url = 'http://urban3p.ru/api/user/?format=json';
	var xhr = new XMLHttpRequest();
	if (xhr.overrideMimeType) {
		xhr.overrideMimeType('text/xml');
	}
	xhr.onreadystatechange = urban3pSetKarma;
	xhr.open('GET', url, true);
	xhr.send(null);
}

function urban3pUpdateKarmaRepeatedly() {
	urban3pUpdateKarma();
	setTimeout(urban3pUpdateKarmaRepeatedly, 60*1000);
}

function urban3pSetKarma() {
	if (this.readyState == 4) {
		var label = ':-(';
			var tooltip = 'Отсутствует связь с urban3p.';
			try {
				if (this.status == 200) {
					var response = JSON.parse(this.responseText);
					username = response.login;
					var karma = response.karma;
					var rating = response.rating;
					label = parseInt(karma, 10) + ' / ' + rating;
					tooltip = "Карма / Рейтинг";
					if (!urban3pIsMailCountHidden()) {
						var mailCount = response.mailCount;
						label += ' / ' + mailCount;
						tooltip += " / Новая почта";
					}
				}
			} catch (e) {
			}

			document.getElementById("urban3p-label").value = label;
			document.getElementById("urban3p-label").tooltipText = tooltip;
		}
	}

	function urban3pShowPrefs() {
		window.openDialog("chrome://urban3p/content/prefs.xul", "_blank", "modal,centerscreen,chrome,resizable=no,dependent=yes");
		urban3pUpdateKarma();
	}
	function urban3pIsMailCountHidden() {
		return Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.urban3p.")
		.getBoolPref("hideMailCount");
	}
	function urban3pLoadProfile(event) {
		var url = 'http://urban3p.ru/my/';
		urban3pLoadPage(event, url);
	}
	function urban3pUrlGo(event, url) {
		urban3pLoadPage(event, 'http://urban3p.ru/'+url);
	}
	function urban3pLoadPage(event, url) {
		var browser = document.getElementById("content");
		if (event.button == 1) {
			var tab = browser.addTab(url);
			browser.selectedTab = tab;
		} else if (event.button == 0) {
			if (!event) {
				openAndReuseOneTabPerURL(url);
			}

			if (event.shiftKey) {
				openDialog("chrome://browser/content/browser.xul", "_blank", "chrome,all,dialog=no", url);
			} else {
				openAndReuseOneTabPerURL(url);
			}
		}
	}

	function openAndReuseOneTabPerURL(url) {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");

		// Check each browser instance for our URL
		var found = false;
		while (!found && browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.gBrowser;

			// Check each tab of this browser instance
			var numTabs = tabbrowser.browsers.length;
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				if (url == currentBrowser.currentURI.spec) {
					// The URL is already opened. Select this tab.
					tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];
					// Focus *this* browser-window
					browserWin.focus();

					found = true;
					break;
				}
			}
		}

	// Our URL isn't open. Open it now.
	if (!found) {
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		if (recentWindow) {
			// Use an existing browser window
			recentWindow.delayedOpenTab(url, null, null, null, null);
		} else {
			// No browser windows are open, so open a new one.
			window.open(url);
		}
	}
}
