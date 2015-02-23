let {
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['ApiObserver'];
this.exports = {ApiObserver};

Cu.import('resource://gre/modules/Services.jsm');

// https://adblockplus.org/blog/modularization-in-a-restartless-extension
function ApiObserver()
{
	return new ApiObserver.prototype.__construct();
};

Object.assign(ApiObserver.prototype,
{

	data: {
		map: {},

		runtime: {},
	},

	options: {
		prefix: '',
	},

	__construct: function()
	{
		var _this = this;

		this.Observer = {
			observe: function(subject, topic, data)
			{
				_this.handler(subject, topic, data);
			},

			QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver]),
		};

		return this;
	},

	topicName: function(topic)
	{
		return this.options.prefix + '' + topic;
	},

	trigger: function(subject, topic, data)
	{
		topic = this.topicName(topic);

		this.triggerHandler(subject, topic, data);

		return this;
	},

	triggerHandler: function(subject, topic, data)
	{
		/*
		if (topic == "adblockplus-require")
		{
			subject.wrappedJSObject.exports = require(data);
		}
		*/

		for (let fn of this.data.map[topic])
		{
			fn.call(this, subject, topic, data);
		}

		this.data.runtime = {
			subject: subject,
			topic: topic,
			data: data,
		};

		return this;
	},

	addListener: function(topic, fn)
	{
		topic = this.topicName(topic);

		if (!this.data.map[topic] || !this.data.map[topic].length)
		{
			this.data.map[topic] = [];

			Services.obs.addObserver(this.Observer, topic, true);
		}

		this.data.map[topic].push(fn);

		return this;
	},

	removeListener: function(topic, fn)
	{
		topic = this.topicName(topic);

		if (arguments.length === 1)
		{
			delete this.data.map[topic];
		}
		else if (this.data.map[topic] && this.data.map[topic].length)
		{
			for (let i in this.data.map[topic])
			{
				if (this.data.map[topic][i] === fn)
				{
					this.data.map[topic].splice(i, 1);
				}
			}

			if (!this.data.map[topic].length)
			{
				Services.obs.removeObserver(this.Observer, topic);
			}
		}

		return this;
	},

});

ApiObserver.prototype.__construct.prototype = ApiObserver.prototype;

//return this.exports;
