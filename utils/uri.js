let
{
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['UriUtils'];
this.exports = this.exports || {};

const __global__ = this;

const QUERYKEY_SKIP = null;
const QUERYKEY_UNDEF = undefined;

function UriUtils(uri)
{
	return new UriUtils.prototype.__construct(uri);
};

UriUtils.prototype = Object.assign(
{

	__cache__: null,
	source: null,

	__construct: function(uri)
	{
		var _this = this;

		this.__cache__ = {};
		this.source = this.createInstance();

		if (uri)
		{
			this.__cache__.source = uri;

			if (/^[a-z-]+:/.exec(uri))
			{
				this.source.spec = uri;
			}
			else
			{
				this.source.fileName = uri;
			}
		}

		for (let name in this.source)
		{
			if (Object.prototype.hasOwnProperty.call(UriUtils.prototype, name))
			{
				continue;
			}

			(function(name)
			{

				if (typeof newUri[name] === 'function')
				{
					this.__defineGetter__(name, function()
					{
						return this.source[name].bind(this.source);
					});
				}
				else
				{

					this.__defineGetter__(name, function()
					{
						return this.source[name];
					});

					this.__defineSetter__(name, function(val)
					{
						this.source[name] = val;
					});

				}

			})(name);
		}

		return this;
	},

	toString: function()
	{
		return this.source.spec;
	},

	clone: function()
	{
		return UriUtils(this.source.spec);
	},

	cloneIgnoringRef: function()
	{
		return UriUtils(this.source.specIgnoringRef);
	},

	queryKey: function(val)
	{
		var type = typeof val;

		if (type !== 'undefined')
		{
			if (type !== 'string')
			{
				val = this.buildParam(val);
			}

			return '' + (this.source.query = val);
		}

		if (this.__cache__.query === this.query)
		{
			return this.__cache__.queryKey;
		}

		delete this.__cache__.query;
		delete this.__cache__.queryKey;

		this.__cache__.query = '' + this.source.query;

		return this.__cache__.queryKey = this.parseParam(this.source.query);
	},

	setDirectory: function(val)
	{
		return this.source.path = val + this.source.fileName + (this.source.query ? '?' + this.source.query: '') + (this.source.ref ? '#' + this.source.ref: '');
	},

	get fragment()
	{
		return this.source.ref;
	},

	set fragment(val)
	{
		this.source.ref = val;
	},

	get directory()
	{
		return this.source.directory;
	},

	set directory(val)
	{
		this.setDirectory(val);
	},

	get spec()
	{
		return this.source.spec;
	},

	set spec(val)
	{
		this.__cache__.source = val;

		this.source.spec = val;
	},

}, Object.assign(UriUtils,
{
	get QUERYKEY_SKIP() QUERYKEY_SKIP,
	get QUERYKEY_UNDEF() QUERYKEY_UNDEF,

	getInstance: function(uri)
	{
		return UriUtils.validInstance(uri) ? uri : UriUtils(uri);
	},

	createInstance: function()
	{
		return Cc['@mozilla.org/network/standard-url;1'].createInstance(Ci.nsIURL);
	},

	validInstance: function(uri)
	{
		if (uri instanceof UriUtils || uri instanceof Ci.nsIURL || uri instanceof UriUtils.prototype.__construct)
		{
			return true;
		}

		return false;
	},

	buildParam: function(val, prefix, d)
	{
		var ret = [];
		prefix = typeof prefix === 'undefined' ? '' : prefix;

		let i = 0;
		for (let k in val)
		{
			let v = val[k];

			if (v === QUERYKEY_SKIP)
			{
				continue;
			}

			if (d)
			{
				k = '[' + ((k + '') === (i + '') ? '' : k) + ']';
			}

			if (typeof v === 'object')
			{
				ret.push(arguments.callee(v, prefix + k, true));
			}
			else
			{
				ret.push(prefix + k + ((v === QUERYKEY_UNDEF) ? '' : '=' + encodeURIComponent(v)));
			}

			i++;
		}

		return ret.join('&');
	},

	// http://stackoverflow.com/questions/1131630/the-param-inverse-function-in-javascript-jquery
	parseParam: function(query)
	{
		var setValue = function(root, path, value)
		{
			if (value === QUERYKEY_SKIP)
			{
				return;
			}

			if (path.length > 1)
			{
				var dir = path.shift();
				if (typeof root[dir] == 'undefined')
				{
					root[dir] = [];
				}

				arguments.callee(root[dir], path, value);
			}
			else
			{
				if (path[0] === '')
				{
					root.push(value);
				}
				else
				{
					root[path[0]] = value;
				}
			}
		};
		var nvp = query.split('&');
		var data = {};
		for (var i = 0; i < nvp.length; i++)
		{
			var pair = nvp[i].split('=');
			var name = decodeURIComponent(pair[0]);
			var value = !pair[1] ? pair[1] : decodeURIComponent(pair[1]);

			if (value === QUERYKEY_SKIP)
			{
				continue;
			}

			var path = name.match(/(^[^\[]+)(\[.*\]$)?/);
			var first = path[1];
			if (path[2])
			{
				//case of 'array[level1]' || 'array[level1][level2]'
				path = path[2].match(/(?=\[(.*)\]$)/)[1].split('][')
			}
			else
			{
				//case of 'name'
				path = [];
			}
			path.unshift(first);

			setValue(data, path, value);
		}
		return data;
	},
}));

(function()
{
	var newUri = UriUtils.prototype.createInstance();

	/*
	['spec', 'prePath', 'scheme', 'userPass', 'username', 'password',
	'hostPort', 'host', 'port', 'path', 'equals', 'schemeIs', 'clone',
	'resolve', 'asciiSpec', 'asciiHost', 'originCharset', 'ref', 'equalsExceptRef', 'cloneIgnoringRef', 'specIgnoringRef', 'hasRef',
	'filePath', 'query', 'directory', 'fileName', 'fileBaseName', 'fileExtension', 'getCommonBaseSpec', 'getRelativeSpec', 'QueryInterface']
	*/
	for (let name in newUri)
	{
		if (Object.prototype.hasOwnProperty.call(UriUtils.prototype, name) || Array.prototype.indexOf.call(['fragment'], name) !== -1)
		{
			continue;
		}

		(function(name)
		{

			if (typeof newUri[name] === 'function')
			{
				UriUtils.prototype.__defineGetter__(name, function()
				{
					return this.source[name].bind(this.source);
				});
			}
			else
			{

				UriUtils.prototype.__defineGetter__(name, function()
				{
					return this.source[name];
				});

				UriUtils.prototype.__defineSetter__(name, function(val)
				{
					this.source[name] = val;
				});

			}

		})(name);
	}
})();

UriUtils.prototype.__construct.prototype = UriUtils.prototype;

this.exports.UriUtils = UriUtils;

//return this.exports;