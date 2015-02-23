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

		nocache: false,

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

		this.module.__defineGetter__('Loader', function()
		{
			return _this;
		});

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

let {UriUtils} = module('utils/uri.js?2222ff66ff22222');

Object.assign(Loader.prototype,
{
	fileext: function (uri)
	{
		return UriUtils.getInstance(uri).fileExtension;
	},

	fix_ext: function(uri, allowExt, defExt)
	{
		uri = UriUtils.getInstance(uri);

		let ext = this.fileext(uri);

		if (!this.isAllowExt(ext, allowExt))
		{
			if (ext = (typeof defExt === 'undefined' ? this.options.defExt : defExt))
			{
				uri.fileName += '.' + ext;
			}
		}

		return uri;
	},

	fix_uri: function(uri, base)
	{
		if (!/^[a-z-]+:/.exec(uri))
		{
			uri = this.fix_ext((base || /([^ ]+\/)[^\/]+$/.exec(Components.stack.caller.filename)[1]) + uri);
		}

		return UriUtils.getInstance(uri);
	},
});

//return this.exports;