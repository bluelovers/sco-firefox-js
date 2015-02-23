let {
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['Bootstrap', 'startup', 'shutdown', 'install', 'uninstall'];
this.exports = this.exports || {};

const __global__ = this;

// https://developer.mozilla.org/en/Extensions/Bootstrapped_extensions#Reason_constants

const APP_STARTUP = 1;		// The application is starting up.
const APP_SHUTDOWN = 2;		// The application is shutting down.
const ADDON_ENABLE = 3;		// The add-on is being enabled.
const ADDON_DISABLE = 4;	// The add-on is being disabled. (Also sent during uninstallation)
const ADDON_INSTALL = 5;	// The add-on is being installed.
const ADDON_UNINSTALL = 6;	// The add-on is being uninstalled.
const ADDON_UPGRADE = 7;	// The add-on is being upgraded.
const ADDON_DOWNGRADE = 8;	// The add-on is being downgraded.

function Bootstrap()
{
	return new Bootstrap.prototype.__construct();
};

Object.assign(Bootstrap.prototype,
{
	get APP_STARTUP() APP_STARTUP,
	get APP_SHUTDOWN() APP_SHUTDOWN,
	get ADDON_ENABLE() ADDON_ENABLE,
	get ADDON_DISABLE() ADDON_DISABLE,
	get ADDON_INSTALL() ADDON_INSTALL,
	get ADDON_UNINSTALL() ADDON_UNINSTALL,
	get ADDON_UPGRADE() ADDON_UPGRADE,
	get ADDON_DOWNGRADE() ADDON_DOWNGRADE,

	data:
	{
		map: {},
	},

	addonData: null,

	__construct: function()
	{
		var _this = this;

		for (let name of['startup', 'shutdown', 'install', 'uninstall'])
		{
			this.data.map[name] = [];

			__global__.exports[name] = __global__[name] = _this[name] = _this[name].bind(_this);
		}

		return this;
	},

	triggerHandler: function(name, params, reason)
	{
		for (let fn of this.data.map[name])
		{
			try
			{
				fn.call(this, params, reason);
			}
			catch (e)
			{
				Cu.reportError(e);
			}
		}

		return this;
	},

	startup: function(params, reason)
	{
		this.addonData = params;

		return this.triggerHandler('startup', params, reason);
	},

	shutdown: function(params, reason)
	{
		return this.triggerHandler('shutdown', params, reason);
	},

	install: function(params, reason)
	{
		return this.triggerHandler('install', params, reason);
	},

	uninstall: function(params, reason)
	{
		return this.triggerHandler('uninstall', params, reason);
	},

	addListener: function(name, fn)
	{
		if (!this.data.map[name])
		{
			this.data.map[name] = [];
		}

		this.data.map[name].push(fn);

		return this;
	},

	removeListener: function(name, fn)
	{
		name = this.topicName(name);

		if (arguments.length === 1)
		{
			this.data.map[name] = [];
		}
		else if (this.data.map[name] && this.data.map[name].length)
		{
			for (let i in this.data.map[name])
			{
				if (this.data.map[name][i] === fn)
				{
					this.data.map[name].splice(i, 1);
				}
			}
		}

		return this;
	},

});

Bootstrap.prototype.__construct.prototype = Bootstrap.prototype;

__global__.Bootstrap = __global__.exports.Bootstrap = new Bootstrap();

//return __global__.exports;