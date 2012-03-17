
var _g_css = "/* css style used to achieve this demo */\n";
var _g_js = "/* javascript code used to achieve this demo */\n";
var _g_one = 0;

function helper(){
	_g_one++;
	if (_g_one != 1)
	{
		return;
	}	
	var s = $('html').find('style').text();
	_g_css += s.replace(/(^\s+)|(\s+$)/, '');
	var j = $('html').find('body>script:first').text();
	_g_js += j.replace(/(^\s+)|(\s+$)/, '');
}

$(document).ready(function(){
	$("pre.code-css").text(_g_css).snippet("css", {style: "bright"});
    $("pre.code-js").text(_g_js).snippet("javascript", {style: "bright"});
});
