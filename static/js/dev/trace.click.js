/*
 行为统计方法调用说明：

 针对链接点击的统计：
 DOM: <a class="link" href=".." position="app_download">Link</a>
 Javascript:
 $('.link').on('click', function() {
 	var el = $(this);
	ClickTrace.pingback(el);
	setTimeout(function() {
		location.href = el.attr('href');
	}, 50);
	return false; //为了在点击链接跳转的时候可以让统计数据发送出去，使用setTimeout做链接跳转
 });

 针对非链接点击的自定义统计:
 ClickTrace.pingback(null, "app_download", JSON.stringify({"vid": 123}));

 include Cookie.js
*/

var ClickTrace = function() {

	var DOC = document,
	WIN = window,

	/* 
	 * 设备是否支持触摸事件
	 * 这里使用WIN.hasOwnProperty('ontouchstart')在Android上会得到错误的结果
	 */
	IsTouch = 'ontouchstart' in WIN,

	UA = WIN.navigator.userAgent,

	IsAndroid = (/Android|HTC/i.test(UA) || !!(WIN.navigator['platform'] + '').match(/Linux/i)), /* HTC Flyer平板的UA字符串中不包含Android关键词 */
	IsIPad = !IsAndroid && /iPad/i.test(UA),
	IsIPhone = !IsAndroid && /iPod|iPhone/i.test(UA),
	IsIOS =  IsIPad || IsIPhone,

	/* 设备屏幕象素密度 */
	PixelRatio = parseFloat(WIN.devicePixelRatio) || 1,

	ScreenSizeCorrect = 1,

	API_KEY = 'f351515304020cad28c92f70f002261c';

	/* Android下window.screen的尺寸可能是物理尺寸，和窗口尺寸不同，用ScreenSizeCorrect转化一下 */
	if (IsAndroid) {
		if ((WIN['screen']['width'] / WIN['innerWidth']).toFixed(2) == PixelRatio.toFixed(2)) {
			ScreenSizeCorrect = 1 / PixelRatio;
		}
	}

	var pingback = function(url) {
		var pingbackURLs = url.split('|'),
			i = 0,
			l = pingbackURLs.length;

		for (; i < l; i++) {
			(new Image()).src = pingbackURLs[i];
		}
	};

	//发送来源统计
	var paramaString = [
		'&uid=', (Cookie.get('SUV') || ''),
		'&ua=h5',
		'&url=', encodeURIComponent(location.href),
		'&refer=', encodeURIComponent(DOC.referrer)
	].join('');

	var channeled = URL.getQueryString('channeled') || '';

	if (channeled) pingback('http://z.m.tv.sohu.com/' + paramaString + '&channeled=' + channeled);

	var clickTrace = {

		/**
		 * 返回指定选择符的DOM集合
		 * @function
		 * @param {RR.dom} el RR.dom对象
		 * @param {String} position (可选)统计字段名，如果为空会尝试从el的position属性获取
		 * @param {String} details (可选)统计的附加数据，JSON.stringify()后的JSON字符串，如果为空会尝试从el的details属性获取
		 */
		pingback: function(el, position, details) {
			var os = '',
				platform = '',
				passport = '',
				screenSize = '',
				screen = WIN['screen'],
				position = position || el.attr('position') || '',
				details = encodeURIComponent(details || (el && el.attr('details')) || '');

			if (IsIOS) {
				os = 'ios';
				if (IsIPad) {
					platform = 'ipad';
				} else if (IsIPhone) {
					platform = 'iphone';
				}
			} else if (IsAndroid) {
				platform = os = 'android';
			} else if (IsWindowsPhone) {
				platform = os = 'windowsphone';
			}

			if ('undefined' !== typeof PassportSC) {
				passport = PassportSC['cookie']['userid'] || '';
			}

			screenSize = screen['width'] * ScreenSizeCorrect + 'x' + screen['height'] * ScreenSizeCorrect;

			paramaString = [
				't=', (+new Date), 
				'&uid=', Cookie.get('SUV') || '', 
				'&position=', position, 
				'&op=click', 
				'&details=', encodeURIComponent(details), 
				'&nid=', (WIN['VideoData'] && WIN['VideoData']['nid']) || '', 
				'&url=', encodeURIComponent(location.href),  
				'&refer=', encodeURIComponent(DOC.referrer),  
				'&screen=', screenSize,
				'&os=', os,
				'&platform=', platform,
				'&passport=', encodeURIComponent(passport)
			].join('');
			pingback('http://z.m.tv.sohu.com/h5_cc.gif?' + paramaString);
		}
	};

	return clickTrace;

}();

