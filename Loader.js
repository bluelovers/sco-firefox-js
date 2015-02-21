
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

this.EXPORTED_SYMBOLS = ['module', 'require'];
this.exports = {module, require};

let {Services, atob, btoa, File, TextDecoder, TextEncoder} = Cu.import("resource://gre/modules/Services.jsm", null);
let XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest");

function module(uri)
{
	if (!/^[a-z-]+:/.exec(uri))
	{
		let ext = fileext(uri);

		if (!(ext === 'js' || ext === 'jsm'))
		{
			ext = 'jsm';
		}

		uri = /([^ ]+\/)[^\/]+$/.exec(Components.stack.caller.filename)[1] + uri + '.' + ext;
	}

	let obj = {};
	Cu.import(uri, obj);
	return obj;
}

function require(module)
{
	let scopes = require.scopes;
	if (!(module in scopes))
	{
		if (false && module == "info")
		{
			// TODO: require('info')
		}
		else
		{
			let ext = fileext(module);

			if (!(ext === 'js' || ext === 'jsm'))
			{
				ext = 'jsm';
			}

			let url = addonData.resourceURI.spec + module + '.' + ext;
			scopes[module] = {
				Cc: Cc,
				Ci: Ci,
				Cr: Cr,
				Cu: Cu,
				atob: atob,
				btoa: btoa,
				File: File,
				require: require,

				onShutdown: onShutdown,

				XMLHttpRequest: XMLHttpRequest,

				exports:
				{}
			};
			Services.scriptloader.loadSubScript(url, scopes[module]);
		}
	}
	return scopes[module].exports;
}

require.scopes = {
	__proto__: null
};

function fileext(file)
{
	(file + '').match(/\.([^\.]+)$/);

	return RegExp.$1;
}
