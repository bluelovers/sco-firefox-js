let {
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['ProtocolChannel'];
this.exports = {
	ProtocolChannel
};

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import('../Utils.js');

const ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);

function ProtocolChannel()
{
	return new ProtocolChannel.prototype.__construct();
};

Object.assign(ProtocolChannel.prototype,
{

	options:
	{
		DummyChannel: DummyChannel,

		schemeName: 'dummy-scheme',
		defaultPort: -1,

		protocolFlags: 0
			| Ci.nsIProtocolHandler.URI_INHERITS_SECURITY_CONTEXT
			| Ci.nsIProtocolHandler.URI_IS_LOCAL_RESOURCE
			| Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE
			| Ci.nsIProtocolHandler.URI_NOAUTH
			| Ci.nsIProtocolHandler.URI_NON_PERSISTABLE
			| Ci.nsIProtocolHandler.URI_NORELATIVE,

		regexp_scheme: null,
	},

	__construct: function(options)
	{
		var _this = this;

		if (options && Utils.getGlobalForObject(options))
		{
			Object.assign(this.options, ProtocolChannel.prototype.options, options);
		}

		return this;
	},

	newChannel: function(aUri)
	{
		var match;

		if (match = this.validChannel(aUri))
		{
			var response = this.newResponse(match);

			if (this.validResponse(response))
			{
				var resource = this.newChannelFromResponse(response, match);

				if (resource)
				{
					return resource;
				}
			}
		}

		return new DummyChannel(aUri);
	},

	newChannelFromResponse: function(response, match)
	{
		// So, fail.  The service only exists in the parent process.
		var script = response[0][0];
		if (script)
		{
			for (var i = 0, resource = null; resource = script.resources[i]; i++)
			{
				if (resource.name == match[2])
				{
					return this.newChannelFromURI(Utils.uriFromUrl(resource.url));
				}
			}
		}
	},

	newChannelFromURI: function(url)
	{
		return ioService.newChannelFromURI(url);
	},

	validChannel: function(aUri)
	{
		if (!aUri || !aUri.spec) return false;

		var match = aUri.spec.match(this.regexp_scheme);

		// Incomplete URI, send a 404.
		if (!match) return false;

		return match;
	},

	validResponse: function(response)
	{
		if (!response) return false;

		// We expect exactly one response, listing exactly one script.
		if (response.length != 1) return false;
		if (response[0].length != 1) return false;

		return response;
	},

	newResponse: function(match)
	{
		if (typeof match === 'string')
		{
			match = var m = aUri.spec.match(this.regexp_scheme);
		}

		var mm = Cc["@mozilla.org/childprocessmessagemanager;1"]
			.getService(Ci.nsISyncMessageSender);
		var response = mm.sendSyncMessage(
			'greasemonkey:scripts-for-uuid',
			{
				'uuid': match[1]
			});

		return response;
	},

	get scheme()
	{
		return this.options.schemeName;
	},
	set scheme(schemeName)
	{
		this.options.schemeName = schemeName;
	},

	get defaultPort()
	{
		return this.options.defaultPort;
	},
	set defaultPort(defaultPort)
	{
		this.options.defaultPort = defaultPort;
	},

	get _contractID()
	{
		return '@mozilla.org/network/protocol;1?name=' + this.schemeName;
	},

	get regexp_scheme()
	{
		return this.options.regexp_scheme || new RegExp(this.schemeName + ':([-0-9a-f]+)\/(.*)');
	},
	set regexp_scheme(val)
	{
		if (typeof val === 'string')
		{
			val = new RegExp(this.schemeName + ':' + val);
		}

		this.options.regexp_scheme = val;
	},

	QueryInterface: XPCOMUtils.generateQI([
		Ci.nsIFactory,
		Ci.nsIProtocolHandler,
		Ci.nsISupportsWeakReference
	]),

	createInstance: function(outer, iid)
	{
		if (outer)
		{
			throw Cr.NS_ERROR_NO_AGGREGATION;
		}
		return this.QueryInterface(iid);
	},

	allowPort: function(aPort, aScheme)
	{
		return false;
	},

	newURI: function(aSpec, aCharset, aBaseUri)
	{
		var uri = Cc['@mozilla.org/network/simple-uri;1']
			.createInstance(Ci.nsIURI);
		uri.spec = aSpec;
		return uri;
	},

	newDummyChannel: function(aUri, aScript)
	{
		return new this.options.DummyChannel(aUri, aScript);
	},

});

ProtocolChannel.prototype.__construct.prototype = ProtocolChannel.prototype;

function DummyChannel(aUri, aScript)
{
	// nsIRequest
	this.loadFlags = 0;
	this.loadGroup = null;
	this.name = aUri.spec;
	this.status = 404;
	this.content = '';

	// nsIChannel
	this.contentCharset = 'utf-8';
	this.contentLength = this.content.length;
	this.contentType = 'application/javascript';
	this.notificationCallbacks = null;
	this.originalURI = aUri;
	this.owner = null;
	this.securityInfo = null;
	this.URI = aUri;
};

// nsIChannel
DummyChannel.prototype.asyncOpen = function(aListener, aContext) {};

//return this.exports;