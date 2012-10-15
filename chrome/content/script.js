window.addEventListener ("load", urban3pLoad, false);

function urban3pLoad() {
	urban3pUpdateKarmaRepeatedly();
}

function urban3pLeftClick(e)
{
	if (e.button == 0)
	{
		if (urban3pGetUsername())
		{
			urban3pUpdateKarma();
		} else {
			urban3pShowPrefs();
		}
	}
}

function urban3pUpdateKarma()
{
	document.getElementById("urban3p-label").value = '…';
	var username = urban3pGetUsername();

	if (username)
	{
		var url = 'http://urban3p.ru/api/user/' + username.toLowerCase();
		var httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType)
		{
			httpRequest.overrideMimeType('text/xml');
		}

		httpRequest.onreadystatechange = function() {
			urban3pSetKarma(httpRequest);
		};
		httpRequest.open('GET', url, true);
		httpRequest.send(null);
   	}
   	else
	{
		document.getElementById("urban3p-label").value = 'urban3p.ru';
		document.getElementById("urban3p-label").tooltipText = 'Щелкните, чтобы настроить.';
	}
}

function urban3pUpdateKarmaRepeatedly()
{
	urban3pUpdateKarma();
	setTimeout("urban3pUpdateKarmaRepeatedly()", 10*60*1000);

}

function urban3pSetKarma(httpRequest)
{
	if (httpRequest.readyState == 4)
	{
		var label = ':-(';
		var tooltip = 'Отсутствует связь с urban3p, либо задан неверный логин.';
		try
		{
			if (httpRequest.status == 200)
			{
				var xmlDoc = httpRequest.responseXML;
				var karma = xmlDoc.getElementsByTagName('karma').item(0).firstChild.data;
				var rating = xmlDoc.getElementsByTagName('rating').item(0).firstChild.data;
				var mailCount = xmlDoc.getElementsByTagName('mailCount').item(0).firstChild.data;
				label = parseInt(karma).toString() + ' / ' + rating;
				tooltip = "Карма / Рейтинг";
				if (!urban3pIsMailCountHidden())
				{
					label += ' / ' + mailCount;
					tooltip += " / Новая почта";
				}
			}
		}
		catch (e)
		{
		}

		document.getElementById("urban3p-label").value = label;
		document.getElementById("urban3p-label").tooltipText = tooltip;
	}
}

function urban3pShowPrefs() {
	window.openDialog("chrome://urban3p/content/prefs.xul", "_blank", "modal,centerscreen,chrome,resizable=no,dependent=yes");
	urban3pUpdateKarma();
}
function urban3pGetUsername() {
	return Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch("extensions.urban3p.")
	.getCharPref("username");
}
function urban3pIsMailCountHidden() {
	return Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch("extensions.urban3p.")
	.getBoolPref("hideMailCount");
}
function urban3pLoadProfile(event) {
	var username = urban3pGetUsername();
	var url = 'http://urban3p.ru/user/'+username.toLowerCase()+'/';
	urban3pLoadPage(event, url);
}
function urban3pUrlGo(event, url) {
	urban3pLoadPage(event, 'http://urban3p.ru/'+url);
}
function urban3pLoadPage(event, url) {
	var browser = document.getElementById("content");
	if (event.button == 1)
	{
		var tab = browser.addTab(url);
		browser.selectedTab = tab;
	}
	else if (event.button == 0)
	{
		if (!event)
		{
			browser.loadURI(url);
			return;
		}

		var shift = event.shiftKey;
		var ctrl =  event.ctrlKey;
		if (shift)
		{
			openDialog("chrome://browser/content/browser.xul", "_blank", "chrome,all,dialog=no", url);
		}
		else
		{
			var tab = browser.addTab(url);
			browser.selectedTab = tab;
		}
	}
}
