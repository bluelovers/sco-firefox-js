
this.EXPORTED_SYMBOLS = ['uriFromUrl'];
this.exports = {
	uriFromUrl
};

var ioService = Components.classes["@mozilla.org/network/io-service;1"]
	.getService(Components.interfaces.nsIIOService);

function uriFromUrl(url, base)
{
	var baseUri = null;
	if (typeof base === "string")
	{
		baseUri = uriFromUrl(base);
	}
	else if (base)
	{
		baseUri = base;
	}

	try
	{
		return ioService.newURI(url, null, baseUri);
	}
	catch (e)
	{
		return null;
	}
}

//return this.exports;
