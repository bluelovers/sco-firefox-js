
var EXPORTED_SYMBOLS = ['console'];

(function(contextSelf)
{
	var o = Components.utils.import("resource://gre/modules/devtools/Console.jsm");

	function createNew()
	{
		// https://developer.mozilla.org/en-US/docs/Web/API/console
		let console = new o.ConsoleAPI();

		console.options = {
			mode: false,
		};

		// for Scratchpad or console
		console.logPrint = function (e)
		{
			var args = this.unwrapArgs(arguments);

			return o.log((args.length == 1) ? args[0] : Array.prototype.slice.call(args, 0));
		};

		console.unwrapArgs = function (args)
		{
			while (args.length == 1 && typeof args[0].callee !== 'undefined')
			{
				args = args[0];
			}

			return args;
		};

		console.assert = function (assertion, e)
		{
			if (assertion)
			{
				Array.prototype.shift.call(arguments);

				this.log(arguments);

				return assertion;
			}

			return false;
		};

		for (let method of ['log', 'error', 'info', 'warn', 'debug', 'exception'])
		{
			if (!(method in o.ConsoleAPI.prototype))
			{
				continue;
			}

			(function(_method){
				console[method] = function (e)
				{
					var args = this.unwrapArgs(arguments);

					if (this.options.mode !== null)
					{
						_method.call(this, (args.length == 1) ? args[0] : Array.prototype.slice.call(args, 0));
					}

					if (this.options.mode !== false)
					{
						return this.logPrint(args);
					}
				};
			})(console['_' + method] = o.ConsoleAPI.prototype[method]);
		}

		console.createNew = createNew;

		return console;
	}

	contextSelf.console = createNew();

})(this);
