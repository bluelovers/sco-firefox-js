let
{
	classes: Cc,
	interfaces: Ci,
	results: Cr,
	utils: Cu,
} = Components;

this.EXPORTED_SYMBOLS = ['capitalize'];
this.exports = {capitalize};

/**
 * http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
 **/
function capitalize(string, lc, all)
{
	if (all)
	{
		return string.split(" ").map(function(currentValue, index, array)
		{
			return currentValue.capitalize(lc);
		}, string).join(" ").split("-").map(function(currentValue, index, array)
		{
			return currentValue.capitalize(false);
		}, string).join("-");
	}
	else
	{
		return lc ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1);
	}
}

/*
if(typeof String.prototype.capitalize !== 'function') {
    String.prototype.capitalize = capitalize;
}
*/

//return this.exports;