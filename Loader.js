let
{
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['Loader', 'module', 'require'];
this.exports = this.exports ||
{};

let
{
	Services, atob, btoa, File, TextDecoder, TextEncoder
} = Cu.import("resource://gre/modules/Services.jsm", null);
let XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1", "nsIXMLHttpRequest");

function Loader()
{
	return new Loader.prototype.__construct();
};

Object.assign(Loader.prototype,
{
	scopes:
	{
		__proto__: null,
	},

	options:
	{
		allowExt: ['js', 'jsm'],

		defExt: 'jsm',

		scopes:
		{
			__proto__: null,
		},
	},

	__construct: function()
	{
		var _this = this;

		for (let name in _this)
		{
			if (typeof _this[name] === 'function' && name !== 'import')
			{
				_this[name] = _this[name].bind(_this);
			}
		}

		this.require.__defineGetter__('Loader', function()
		{
			return _this;
		});

		return this;
	},

	isAllowExt: function(ext, allowExt)
	{
		return Array.prototype.indexOf.call(typeof allowExt === 'undefined' ? this.options.allowExt : allowExt, ext) !== -1
	},

	parse_uri: function (str, component)
	{
		// http://kevin.vanzonneveld.net
		// +      original by: Steven Levithan (http://blog.stevenlevithan.com)
		// + reimplemented by: Brett Zamir (http://brett-zamir.me)
		// + input by: Lorenzo Pisani
		// + input by: Tony
		// + improved by: Brett Zamir (http://brett-zamir.me)
		// %          note: Based on http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
		// %          note: blog post at http://blog.stevenlevithan.com/archives/parseuri
		// %          note: demo at http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
		// %          note: Does not replace invalid characters with '_' as in PHP, nor does it return false with
		// %          note: a seriously malformed URL.
		// %          note: Besides function name, is essentially the same as parseUri as well as our allowing
		// %          note: an extra slash after the scheme/protocol (to allow file:/// as in PHP)
		// *     example 1: parse_url('http://username:password@hostname/path?arg=value#anchor');
		// *     returns 1: {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
		var key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
				'relative', 'path', 'directory', 'file', 'query', 'fragment'
			],
			ini = (this.php_js && this.php_js.ini) ||
			{},
			mode = (ini['phpjs.parse_url.mode'] && ini['phpjs.parse_url.mode'].local_value) || 'loose',
			parser = {
				php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
			};

		var m = parser[mode].exec(str),
			uri = {},
			i = 14;
		while (i--)
		{
			if (m[i])
			{
				uri[key[i]] = m[i];
			}
			else
			{
				uri[key[i]] = '';
			}
		}

		if (component)
		{
			return uri[component.replace('PHP_URL_', '').toLowerCase()];
		}
		if (mode !== 'php')
		{
			var name = (ini['phpjs.parse_url.queryKey'] && ini['phpjs.parse_url.queryKey'].local_value) || 'queryKey';
			parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
			uri[name] = {};
			uri[key[12]].replace(parser, function($0, $1, $2)
			{
				if ($1)
				{
					uri[name][$1] = $2;
				}
			});
		}

		//delete uri.source;
		return uri;
	},

	pack_uri: function(uri)
	{

	},

	fix_ext: function(uri, allowExt, defExt)
	{
		let ext = this.fileext(uri);

		if (!this.isAllowExt(ext, allowExt))
		{
			if (ext = (typeof defExt === 'undefined' ? this.options.defExt : defExt))
			{
				uri += '.' + ext;
			}
		}

		return uri;
	},

	fix_uri: function(uri, base)
	{
		if (!/^[a-z-]+:/.exec(uri))
		{
			uri = this.fix_ext(uri);

			uri = (base || /([^ ]+\/)[^\/]+$/.exec(Components.stack.caller.filename)[1]) + uri;
		}

		return uri.replace('\\', '/');
	},

	module: function(uri, base)
	{
		let obj = {};
		this.import(this.fix_uri(uri), obj);
		return obj;
	},

	maekScopes: function(extend_scopes)
	{
		return Object.assign(
		{},
		{
			Cc: Cc,
			Ci: Ci,
			Cr: Cr,
			Cu: Cu,
			atob: atob,
			btoa: btoa,
			File: File,
			require: this.require,

			XMLHttpRequest: XMLHttpRequest,

			exports:
			{},
		}, this.options.scopes, extend_scopes ||
		{});
	},

	require: function(module, extend_scopes)
	{
		let scopes = this.scopes;
		if (!(module in scopes))
		{
			if (false && module == "info")
			{
				// TODO: require('info')
			}
			else
			{
				let base = '';

				if (typeof Bootstrap !== 'undefined' && Bootstrap.addonData)
				{
					base = Bootstrap.addonData.resourceURI.spec;
				}

				let uri = this.fix_uri(module, base);

				scopes[module] = this.maekScopes(extend_scopes);

				Services.scriptloader.loadSubScript(uri, scopes[module]);
			}
		}
		return scopes[module].exports;
	},

	fileext: function(file)
	{
		(file + '').match(/\.([^\.]+)$/);

		return RegExp.$1;
	},

	get import() Components.utils.import,

});

Loader.prototype.__construct.prototype = Loader.prototype;

var
{
	module, require
} = new Loader();

this.exports.module = module;
this.exports.require = require;
this.exports.Loader = Loader;

//return this.exports;