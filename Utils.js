let {
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

const __global__ = this;
this.exports = this.exports || {};

//Cu.import('Loader.js');

this[this.EXPORTED_SYMBOLS = ['Utils']] = this.exports.Utils = {

	inArray: function (needle, haystack, argstrict)
	{
		if (typeof argstrict === 'undefined' || argstrict == true)
		{
			return Array.prototype.indexOf.call(haystack, needle) !== -1;
		}
		else
		{
			for (key in haystack)
			{
				if (haystack[key] == needle)
				{
					return true;
				}
			}
		}

		return false;
	},

	isArray: function (haystack)
	{
		return Array.isArray(haystack);
	},

	isPlainObject: function(obj)
	{
		if (!obj || typeof obj !== 'object' || obj.nodeType || obj == window || obj == Utils.getGlobalForObject())
		{
			return false;
		}

		return true;
	},

	getGlobalForObject: function (context)
	{
		return Cu.getGlobalForObject(typeof context === 'undefined' ? {} : context);
	},

	exportsForObject: function (argexports, context, global)
	{
		if (context === true)
		{
			context = Utils.getGlobalForObject();
		}
		else
		{
			context = context || {};
		}

		if (Utils.isArray(argexports))
		{
			global = global || __global__;

			argexports.forEach(function(element, index, array){
				context[element] = typeof element !== 'string' ? element : global[element];
			});
		}
		else
		{
			for (let index in argexports)
			{
				context[index] = argexports[index];
			}
		}

		return context;
	},

};

//return this.exports;
