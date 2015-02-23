
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

(function(){

	var {Bootstrap} = module('bootstrap.js');

	function module(uri, base)
	{
		if (!/^[a-z-]+:/.exec(uri))
		{
			let ext = fileext(uri);

			if (!(ext === 'js' || ext === 'jsm'))
			{
				uri += '.jsm'
			}

			uri = (base || /([^ ]+\/)[^\/]+$/.exec(Components.stack.caller.filename)[1] + '../') + uri;
		}

		let obj = {};
		Cu.import(uri, obj);
		return obj;
	}

	function fileext(file)
	{
		(file + '').match(/\.([^\.]+)$/);

		return RegExp.$1;
	}

})();
