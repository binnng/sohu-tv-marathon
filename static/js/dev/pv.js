/**
 * PV统计
 */

(function() {

	var WIN = window,
		DOC = document,
		Cookie = WIN['Cookie'];

	var loadScript = function(url, callback, opts) {
		var head = DOC.getElementsByTagName('head')[0] || DOC.body,
			script = DOC.createElement('script'),
			done = false;

		script.src = url;

		script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState !== 'loading')) {
				done = true;
				if(callback) callback.apply(null, opts || []);
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
			}
		};
		head.appendChild(script);
	};

	/*  统计用的用户唯一ID */
	var cookieSUV = Cookie.get('SUV'),
		cookieIPLOC = Cookie.get('IPLOC');
	if (!cookieSUV || !cookieIPLOC) {
		var _suv = (+new Date)*1000+Math.round(Math.random()*1000);
		if (!cookieSUV) {
			Cookie.set('SUV', _suv, 50000, '.sohu.com');
		}
		if (!cookieIPLOC) {
			loadScript('//pv.sohu.com/suv/' + _suv);
		}
	}

	loadScript('http://tv.sohu.com/upload/touch/static/scripts/tv/min.hdpv.js');

	WIN['_iwt_UA'] = 'UA-sohu-123456';
	loadScript('http://tv.sohu.com/upload/Trace/iwt-min.js');

	loadScript('http://js.mail.sohu.com/pv/pv_tv.1107251650.js');
	loadScript('http://tv.sohu.com/upload/Trace/wrating.js');

	loadScript((DOC.location.protocol == 'https:' ? 'https://sb' : 'http://b') + '.scorecardresearch.com/beacon.js', function() {
		if ('undefined' !== typeof WIN['COMSCORE']) {
			WIN['COMSCORE']['beacon']({
				'c1': '2', 
				'c2': '7395122', 
				'c3': '', 
				'c4': '', 
				'c5': '', 
				'c6': '', 
				'c15': ''
			}); 
		}
	});

	/*
	if (IsAndroid) {
		var connectionType = Util.getConnectionType();
		if (!connectionType) {
			connectionType = 'unknow';
		}
		ClickTrace.pingback(null, 'nettype_'  + (IS_EXTERNAL_PLAYER ? 'external_' : '') + connectionType);
	}*/
})()
