
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const __global__ = this;
this.exports = this.exports || {};

this[this.EXPORTED_SYMBOLS = ['Utils']] = exports.Utils = {

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